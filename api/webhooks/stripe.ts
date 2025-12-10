import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    // apiVersion defaults to the version bound to the library or account
});

const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.VITE_SUPABASE_ANON_KEY!
);

export const config = {
    api: {
        bodyParser: false,
    },
};

async function buffer(readable: any) {
    const chunks = [];
    for await (const chunk of readable) {
        chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
    }
    return Buffer.concat(chunks);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const buf = await buffer(req);
    const sig = req.headers['stripe-signature'] as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
    } catch (err: any) {
        console.error('Erro ao verificar webhook:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Processar eventos
    try {
        switch (event.type) {
            case 'checkout.session.completed':
                const session = event.data.object as Stripe.Checkout.Session;
                await handleCheckoutSessionCompleted(session);
                break;

            case 'customer.subscription.updated':
                const subscriptionUpdated = event.data.object as Stripe.Subscription;
                await handleSubscriptionUpdated(subscriptionUpdated);
                break;

            case 'customer.subscription.deleted':
                const subscriptionDeleted = event.data.object as Stripe.Subscription;
                await handleSubscriptionDeleted(subscriptionDeleted);
                break;

            default:
                console.log(`Evento não tratado: ${event.type}`);
        }

        res.status(200).json({ received: true });
    } catch (error: any) {
        console.error('Erro ao processar webhook:', error);
        res.status(500).json({ error: 'Erro ao processar webhook', details: error.message });
    }
}

// Handlers de eventos
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
    const userId = session.metadata?.userId;
    const customerId = session.customer as string;
    const subscriptionId = session.subscription as string;

    if (!userId) {
        console.error('userId não encontrado nos metadados da sessão');
        return;
    }

    // Atualizar usuário no Supabase
    const { error } = await supabase
        .from('users')
        .update({
            is_premium: true,
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            subscription_status: 'active',
            premium_since: new Date().toISOString(),
        })
        .eq('id', userId);

    if (error) {
        console.error('Erro ao atualizar usuário:', error);
    } else {
        console.log(`Assinatura ativada para usuário ${userId}`);
    }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
    const status = subscription.status;

    // Atualizar status da assinatura
    const { error } = await supabase
        .from('users')
        .update({
            is_premium: status === 'active',
            subscription_status: status,
        })
        .eq('stripe_subscription_id', subscription.id);

    if (error) {
        console.error('Erro ao atualizar assinatura:', error);
    } else {
        console.log(`Assinatura atualizada: ${subscription.id} - Status: ${status}`);
    }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    // Remover status premium
    const { error } = await supabase
        .from('users')
        .update({
            is_premium: false,
            subscription_status: 'canceled',
        })
        .eq('stripe_subscription_id', subscription.id);

    if (error) {
        console.error('Erro ao cancelar assinatura:', error);
    } else {
        console.log(`Assinatura cancelada: ${subscription.id}`);
    }
}
