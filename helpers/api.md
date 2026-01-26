# API Helper Functions Usage

This document explains how to use the API helper functions located in `helpers/api.ts`. These functions provide a convenient way to interact with your backend API, handling request methods, JSON parsing, and error handling.

## Configuration

Before using these helpers, ensure the following environment variables are set and properly configured in your Next.js project:

-   `NEXT_PUBLIC_API_URL`: The base URL for your primary API endpoints (e.g., `https://api.example.com`).
-   `NEXT_PUBLIC_EXECUTION_URL`: The base URL for your execution-specific API endpoints (e.g., `https://execution.example.com`).

Additionally, the `constants/ApiRoutes.ts` file defines specific paths used by the execution helpers:

```typescript
export const EXECUTION_ROUTES = {
    SUBMIT_CODE: '/execution/submit-code', // Your actual path for submitting code
    GET_OUTPUT: '/execution/output',       // Your actual path for getting execution output
};
```

Update these paths to match your backend's actual endpoints.

## Generic HTTP Methods

### `get<T>(path: string, params?: Record<string, any>, options?: RequestOptions): Promise<T>`

Sends an HTTP `GET` request.

-   `path`: The API endpoint path, relative to `NEXT_PUBLIC_API_URL` (e.g., `/users`).
-   `params` (optional): An object where keys and values will be appended as query parameters to the URL.
-   `options` (optional): Standard `RequestInit` options for `fetch`, plus custom headers.
-   Returns: A Promise that resolves to the parsed JSON response of type `T`.

#### Example Usage:

```typescript
import { get } from '@/helpers/api';

interface User {
    id: string;
    name: string;
}

async function fetchUsers() {
    try {
        const users = await get<User[]>('/users', { limit: 10, page: 1 });
        console.log('Users:', users);
    } catch (error) {
        console.error('Failed to fetch users:', error);
    }
}

fetchUsers();
```

### `post<T>(path: string, data: any, options?: RequestOptions): Promise<T>`

Sends an HTTP `POST` request with a JSON body.

-   `path`: The API endpoint path, relative to `NEXT_PUBLIC_API_URL` (e.g., `/users`).
-   `data`: The JavaScript object to be sent as the request body (will be `JSON.stringify`'d).
-   `options` (optional): Standard `RequestInit` options for `fetch`, plus custom headers.
-   Returns: A Promise that resolves to the parsed JSON response of type `T`.

#### Example Usage:

```typescript
import { post } from '@/helpers/api';

interface NewUser {
    name: string;
    email: string;
}

interface CreatedUser {
    id: string;
    name: string;
    email: string;
}

async function createUser(userData: NewUser) {
    try {
        const newUser = await post<CreatedUser>('/users', userData);
        console.log('Created user:', newUser);
    } catch (error) {
        console.error('Failed to create user:', error);
    }
}

createUser({ name: 'John Doe', email: 'john@example.com' });
```

### `put<T>(path: string, data: any, options?: RequestOptions): Promise<T>`

Sends an HTTP `PUT` request with a JSON body.

-   `path`: The API endpoint path, relative to `NEXT_PUBLIC_API_URL` (e.g., `/users/123`).
-   `data`: The JavaScript object to be sent as the request body (will be `JSON.stringify`'d).
-   `options` (optional): Standard `RequestInit` options for `fetch`, plus custom headers.
-   Returns: A Promise that resolves to the parsed JSON response of type `T`.

#### Example Usage:

```typescript
import { put } from '@/helpers/api';

interface UpdatedUser {
    name: string;
}

interface User {
    id: string;
    name: string;
    email: string;
}

async function updateUser(userId: string, updateData: UpdatedUser) {
    try {
        const updatedUser = await put<User>(`/users/${userId}`, updateData);
        console.log('Updated user:', updatedUser);
    } catch (error) {
        console.error('Failed to update user:', error);
    }
}

updateUser('123', { name: 'Jane Doe' });
```

## Execution-Specific Helpers

These helpers are designed for interacting with the `NEXT_PUBLIC_EXECUTION_URL` and specific routes defined in `EXECUTION_ROUTES`.

### `postExecution<T>(data: any, options?: RequestOptions): Promise<T>`

Sends an HTTP `POST` request to the `SUBMIT_CODE` endpoint defined in `EXECUTION_ROUTES`.

-   `data`: The JavaScript object to be sent as the request body (e.g., code to be executed, language, etc.).
-   `options` (optional): Standard `RequestInit` options for `fetch`, plus custom headers.
-   Returns: A Promise that resolves to the parsed JSON response of type `T` (e.g., a job ID or initial execution status).

#### Example Usage:

```typescript
import { postExecution } from '@/helpers/api';

interface CodeSubmission {
    code: string;
    language: string;
}

interface ExecutionResult {
    jobId: string;
    status: string;
}

async function submitCodeForExecution(submission: CodeSubmission) {
    try {
        const result = await postExecution<ExecutionResult>(submission);
        console.log('Code submission result:', result);
    } catch (error) {
        console.error('Failed to submit code:', error);
    }
}

submitCodeForExecution({ code: 'console.log("Hello")', language: 'javascript' });
```

### `getExecution<T>(params?: Record<string, any>, options?: RequestOptions): Promise<T>`

Sends an HTTP `GET` request to the `GET_OUTPUT` endpoint defined in `EXECUTION_ROUTES`.

-   `params` (optional): An object where keys and values will be appended as query parameters to the URL (e.g., `jobId` to retrieve output for a specific execution).
-   `options` (optional): Standard `RequestInit` options for `fetch`, plus custom headers.
-   Returns: A Promise that resolves to the parsed JSON response of type `T` (e.g., the output of the executed code).

#### Example Usage:

```typescript
import { getExecution } from '@/helpers/api';

interface ExecutionOutput {
    jobId: string;
    output: string;
    error?: string;
}

async function getExecutionOutput(jobId: string) {
    try {
        const output = await getExecution<ExecutionOutput>({ jobId });
        console.log('Execution output:', output);
    } catch (error) {
        console.error('Failed to get execution output:', error);
    }
}

getExecutionOutput('some-job-id-123');
```
