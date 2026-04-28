"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { signIn, signUp } from "@/lib/actions/auth.action";
import { auth } from "@/firebase/client";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { setSessionCookie } from "@/lib/actions/auth.action";

const authSchema = (type: "sign-in" | "sign-up") =>
    z.object({
        name: type === "sign-up" ? z.string().min(2, "Name is required") : z.string().optional(),
        email: z.string().email("Invalid email"),
        password: z.string().min(6, "Password must be at least 6 characters"),
    });

const AuthForm = ({ type }: { type: "sign-in" | "sign-up" }) => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const form = useForm({
        resolver: zodResolver(authSchema(type)),
        defaultValues: { name: "", email: "", password: "" },
    });

    const onSubmit = async (data: any) => {
        setLoading(true);
        try {
            if (type === "sign-up") {
                const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
                const idToken = await userCredential.user.getIdToken();
                await signUp({ uid: userCredential.user.uid, name: data.name, email: data.email });
                await setSessionCookie(idToken);
                toast.success("Account created successfully!");
                window.location.replace("/");
            } else {
                const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
                const idToken = await userCredential.user.getIdToken();
                await signIn({ email: data.email, idToken });
                toast.success("Signed in successfully!");
                window.location.replace("/");
            }
        } catch (error: any) {
            toast.error(error.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen px-4">
            <div className="w-full max-w-md bg-black/60 backdrop-blur-lg border border-white/10 rounded-2xl p-8 shadow-2xl">
                <div className="flex flex-col items-center mb-8">
                    <Image src="/logo.svg" alt="logo" width={50} height={50} />
                    <h1 className="text-white text-2xl font-bold mt-3">Intvu</h1>
                    <p className="text-slate-400 text-sm mt-1">Get AI-Ready for Your Dream Job</p>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                        {type === "sign-up" && (
                            <FormField control={form.control} name="name" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-white">Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Your full name" className="bg-white/10 border-white/20 text-white placeholder:text-gray-500" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        )}

                        <FormField control={form.control} name="email" render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-white">Email</FormLabel>
                                <FormControl>
                                    <Input type="email" placeholder="you@example.com" className="bg-white/10 border-white/20 text-white placeholder:text-gray-500" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <FormField control={form.control} name="password" render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-white">Password</FormLabel>
                                <FormControl>
                                    <Input type="password" placeholder="••••••••" className="bg-white/10 border-white/20 text-white placeholder:text-gray-500" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg">
                            {loading ? "Please wait..." : type === "sign-up" ? "Create an Account" : "Sign in"}
                        </Button>
                    </form>
                </Form>

                <p className="text-center text-slate-400 text-sm mt-6">
                    {type === "sign-up" ? (
                        <>Have an account already? <Link href="/sign-in" className="text-blue-400 hover:underline">Sign in</Link></>
                    ) : (
                        <>No account yet? <Link href="/sign-up" className="text-blue-400 hover:underline">Sign up</Link></>
                    )}
                </p>
            </div>
        </div>
    );
};

export default AuthForm;