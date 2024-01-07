import { NextResponse } from 'next/server';
export async function middleware(request) {
    let token = request?.cookies?.get('token')?.value;

    if (!token) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    try {

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_ROOT_URL}/token-verify`, {
            headers: {
                'Authorization': token
            }
        });

        if (response.status !== 200) {
            return NextResponse.redirect(new URL('/login', request.url));
        }

        return NextResponse.next();
    } catch (err) {
        console.error('Error in token verification:', err);
        return NextResponse.redirect(new URL('/login', request.url));
    }
}

export const config = {
    matcher: '/admin/:path*',
};
