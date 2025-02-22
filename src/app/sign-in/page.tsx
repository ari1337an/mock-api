import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="bg-gray-800 p-8 rounded-lg shadow-xl">
                <SignIn 
                    appearance={{
                        elements: {
                            rootBox: "mx-auto",
                            card: "bg-gray-800",
                            headerTitle: "text-gray-100",
                            headerSubtitle: "text-gray-400",
                            socialButtonsBlockButton: "bg-gray-700 hover:bg-gray-600",
                            socialButtonsBlockButtonText: "text-gray-100",
                            formFieldLabel: "text-gray-300",
                            formFieldInput: "bg-gray-700 text-gray-100 border-gray-600",
                            footerActionText: "text-gray-400",
                            footerActionLink: "text-blue-400 hover:text-blue-300",
                        },
                    }}
                />
            </div>
        </div>
    )
}