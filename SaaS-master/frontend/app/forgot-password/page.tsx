import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from 'next/link'
import Image from 'next/image'
import ForgotPasswordForm from "@/components/ForgotPasswordForm"

export default function ForgotPassword() {
    return (
        <div className="flex items-center justify-center bg-muted min-h-screen p-4">
            <Card className="w-full max-w-[400px] mx-auto">
                <CardHeader className="space-y-1 px-4 sm:px-6 pt-6">
                    <div className="flex justify-center py-3 sm:py-4">
                        <Link href='/'>
                            <Image 
                                src="/logo.png" 
                                alt="logo" 
                                width={50} 
                                height={50} 
                                className="w-10 h-10 sm:w-12 sm:h-12"
                            />
                        </Link>
                    </div>

                    <CardTitle className="text-xl sm:text-2xl font-bold text-center">
                        Reset Password
                    </CardTitle>
                    <CardDescription className="text-center text-sm sm:text-base">
                        Enter your email to receive a reset link
                    </CardDescription>
                </CardHeader>
                <CardContent className="px-4 sm:px-6">
                    <ForgotPasswordForm />
                </CardContent>
                <CardFooter className="flex-col text-center px-4 sm:px-6 pb-6">
                    <Link 
                        className="w-full text-sm text-muted-foreground hover:text-primary transition-colors" 
                        href="/login"
                    >
                        Remember your password? Login
                    </Link>
                </CardFooter>
            </Card>
        </div>
    )
}