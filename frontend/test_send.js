const axios = require('axios');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

async function testSendMessage() {
    try {
        const conversations = await axios.get('http://localhost:8000/api/v1/conversations', {
            headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_BASE_URL.split('\n')[0]}` } // wait, this is not right. The token is not in .env.local
        });
        console.log(conversations.data);
    } catch (e) {
        console.log(e.response ? e.response.data : e.message);
    }
}
testSendMessage();
