/* eslint-disable @typescript-eslint/no-explicit-any */

import { EXECUTION_ROUTES } from '@/constants/ApiRoutes';
import { NEXT_PUBLIC_API_URL, NEXT_PUBLIC_EXECUTION_URL } from '@/constants/config';

interface RequestOptions extends RequestInit {
    headers?: Record<string, string>;
}

async function handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(errorData.message || 'Something went wrong');
    }
    return response.json();
}

export async function get<T>(path: string, params?: Record<string, any>, options?: RequestOptions): Promise<T> {
    const url = new URL(`${NEXT_PUBLIC_API_URL}${path}`);
    if (params) {
        Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
    }

    const response = await fetch(url.toString(), {
        method: 'GET',
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers,
        },
    });
    return handleResponse(response);
}

export async function post<T>(path: string, data: any, options?: RequestOptions): Promise<T> {
    const response = await fetch(`${NEXT_PUBLIC_API_URL}${path}`, {
        method: 'POST',
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers,
        },
        body: JSON.stringify(data),
    });
    return handleResponse(response);
}

export async function put<T>(path: string, data: any, options?: RequestOptions): Promise<T> {
    const response = await fetch(`${NEXT_PUBLIC_API_URL}${path}`, {
        method: 'PUT',
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers,
        },
        body: JSON.stringify(data),
    });
    return handleResponse(response);
}

// Specific helpers for execution
export async function postExecution<T>(data: any, options?: RequestOptions): Promise<T> {
    const response = await fetch(`${NEXT_PUBLIC_EXECUTION_URL}${EXECUTION_ROUTES.SUBMIT_CODE}`, {
        method: 'POST',
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers,
        },
        body: JSON.stringify(data),
    });
    return handleResponse(response);
}

export async function getExecution<T>(params?: Record<string, any>, options?: RequestOptions): Promise<T> {
    const url = new URL(`${NEXT_PUBLIC_EXECUTION_URL}${EXECUTION_ROUTES.GET_OUTPUT}`);
    if (params) {
        Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
    }

    const response = await fetch(url.toString(), {
        method: 'GET',
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers,
        },
    });
    return handleResponse(response);
}
