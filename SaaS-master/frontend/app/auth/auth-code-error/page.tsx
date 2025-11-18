import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from 'next/link'
import { AlertCircle } from 'lucide-react'

export default function AuthCodeError() {
    return (
        <div className="flex items-center justify-center bg-muted min-h-screen">
            <Card className="w-[400px] mx-auto">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <AlertCircle className="h-12 w-12 text-red-500" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-red-600">Authentication Error</CardTitle>
                    <CardDescription>
                        There was an error processing your authentication. This could be due to:
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <ul className="text-sm text-gray-600 space-y-2">
                        <li>• Invalid or expired authentication code</li>
                        <li>• Network connectivity issues</li>
                        <li>• Server configuration problems</li>
                    </ul>
                    <div className="flex flex-col space-y-2">
                        <Link href="/login" className="w-full">
                            <Button className="w-full">Try Again</Button>
                        </Link>
                        <Link href="/" className="w-full">
                            <Button variant="outline" className="w-full">Go Home</Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
