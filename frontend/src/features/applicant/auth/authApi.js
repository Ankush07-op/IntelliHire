// Temporary in-memory mock. Replace the body of login()/register() with
// axiosInstance calls once the real backend endpoint is ready.

const MOCK_USERS = [
    { id: "u1", name: "Demo User", email: "demo@test.com", password: "password123" },
];

function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function login({ email, password }) {
    await delay(500);

    const found = MOCK_USERS.find((u) => u.email === email && u.password === password);
    if (!found) {
        throw new Error("Invalid email or password");
    }

    return {
        token: "mock-jwt-token",
        user: { id: found.id, name: found.name, email: found.email },
    };
}

export async function register({ name, email, password }) {
    await delay(500);

    const exists = MOCK_USERS.some((u) => u.email === email);
    if (exists) {
        throw new Error("An account with this email already exists");
    }

    const newUser = { id: `u${MOCK_USERS.length + 1}`, name, email, password };
    MOCK_USERS.push(newUser);

    return {
        token: "mock-jwt-token",
        user: { id: newUser.id, name: newUser.name, email: newUser.email },
    };
}