import { db } from '../utils/db/db'
import { usersTable } from '../utils/db/schema'
import { createStripeCustomer } from '../utils/stripe/api'
import { eq } from 'drizzle-orm'

async function migrateStripeCustomers() {
    const users = await db.select().from(usersTable)
    
    for (const user of users) {
        if (user.stripe_id && user.stripe_id.startsWith('mock_customer_')) {
            console.log(`Migrating user: ${user.email}`)
            try {
                const realStripeId = await createStripeCustomer(user.id, user.email, user.name)
                await db.update(usersTable)
                    .set({ stripe_id: realStripeId })
                    .where(eq(usersTable.id, user.id))
                console.log(`✅ Migrated ${user.email} to ${realStripeId}`)
            } catch (error) {
                console.error(`❌ Failed to migrate ${user.email}:`, error)
            }
        }
    }
    console.log('Migration complete!')
}

migrateStripeCustomers()