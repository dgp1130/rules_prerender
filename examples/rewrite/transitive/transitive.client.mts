export async function getGreeting(): Promise<string> {
    const res = await fetch('/greeting.txt');
    const greeting = await res.text();
    return greeting.trim();
}
