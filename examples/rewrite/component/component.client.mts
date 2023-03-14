import { getGreeting } from '../transitive/transitive.client.mjs';

(async () => {
    const greeting = await getGreeting();
    console.log(greeting);
})();
