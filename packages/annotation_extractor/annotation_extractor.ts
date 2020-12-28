async function main(): Promise<number> {
    console.log('Hello, World!');
    return 0;
}

main().catch((err) => {
    console.error(err.message);
    return 1;
}).then((code) => {
    process.exit(code);
});
