'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/utils/supabase/server'



export async function login(prevState: any, formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email')
    const password = formData.get('password')

    if (!email || typeof email !== 'string') {
        return { error: 'Email is required' }
    }

    if (!password || typeof password !== 'string') {
        return { error: 'Password is required' }
    }

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/', 'layout')
    redirect('/')
}

export async function signup(prevState: any, formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email')
    const password = formData.get('password')
    const confirmPassword = formData.get('confirmPassword')
    const username = formData.get('username')

    if (!username || typeof username !== 'string') {
        return { error: 'Username is required' }
    }

    if (!email || typeof email !== 'string') {
        return { error: 'Email is required' }
    }

    if (!password || typeof password !== 'string') {
        return { error: 'Password is required' }
    }

    if (password !== confirmPassword) {
        return { error: 'Passwords do not match' }
    }

    const data = {
        email,
        password,
        options: {
            data: {
                username,
            },
        },
    }

    const { error } = await supabase.auth.signUp(data)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/', 'layout')
    redirect('/')
}

export async function logout() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    revalidatePath('/', 'layout')
    redirect('/login')
}
