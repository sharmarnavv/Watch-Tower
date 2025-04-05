"use client";

import {
    // ClerkProvider,
    SignInButton,
    SignUpButton,
    SignedIn,
    SignedOut,
    UserButton,
  } from '@clerk/nextjs'

export function Appbar(){
    return <div className="flex justify-between items-center p-4">
        <div>Dpin uptime</div>
        {/*The following is the code for the sign in button and sign up button and the user button
        //The SignedOut and SignedIn components are used to determine if the user is signed in or not
        // If the user is signed in, the user button is shown
        // If the user is not signed in, the sign in button and sign up button are shown*/}
        <div>
            <SignedOut>
                <SignInButton />
                <SignUpButton />
                </SignedOut>
            <SignedIn>
                <UserButton />
            </SignedIn>
        </div>
    </div>
}
