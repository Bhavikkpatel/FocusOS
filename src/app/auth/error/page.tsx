"use client";

import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AuthErrorPage() {
    const searchParams = useSearchParams();
    const error = searchParams.get("error");

    const errorMessages: Record<string, string> = {
        Configuration: "There is a problem with the server configuration. Check your environment variables.",
        AccessDenied: "You do not have permission to sign in.",
        Verification: "The verification link has expired or has already been used.",
        Default: "An unexpected error occurred during authentication.",
        Callback: "The authentication callback failed. This often means the Redirect URI or Secret is mismatched.",
    };

    const errorMessage = error ? errorMessages[error] || errorMessages.Default : errorMessages.Default;

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 dark:bg-gray-900">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
                        <AlertCircle className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-2xl font-bold">Authentication Error</CardTitle>
                    <CardDescription>
                        Something went wrong while trying to sign you in.
                    </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                    <div className="rounded-lg bg-red-50 p-4 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
                        <p className="font-semibold">Error Code: {error || "Unknown"}</p>
                        <p className="mt-1">{errorMessage}</p>
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-2">
                    <Button asChild className="w-full">
                        <Link href="/auth/signin">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Sign In
                        </Link>
                    </Button>
                    <Button variant="ghost" asChild className="w-full">
                        <Link href="/">Go to Home</Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
