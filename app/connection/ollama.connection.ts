// app/connection/ollama.connection.ts

export async function promptOllama(prompt: string, model = "llama3.2"): Promise<string> {
    const res = await fetch("http://ollama:11434/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            model,
            prompt,
            stream: false,
            options: {
                seed: Math.floor(Math.random() * 100000),  
                temperature: 0.8,     
            },
        }),
    });

    if (!res.ok)
        throw new Error(`Ollama error: ${res.statusText}`);

    const data = await res.json();
    return data.response;
}