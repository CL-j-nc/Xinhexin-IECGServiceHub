export const onRequestGet = async () => {
    return new Response(
        JSON.stringify({
            ok: true,
            source: 'pages-function',
            message: 'Pages backend is alive'
        }),
        {
            headers: {
                'Content-Type': 'application/json'
            }
        }
    );
};