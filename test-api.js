const crypto = require('crypto');

function createToken() {
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const payload = Buffer.from(JSON.stringify({
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier": "1",
        "email": "admin@example.com",
        "role": "1", // Admin
        "exp": Math.floor(Date.now() / 1000) + (60 * 60),
        "iss": "InterviewProAPI",
        "aud": "InterviewProClient"
    })).toString('base64url');
    
    const secret = "ThisIsASecretKeyForInterviewProAIPlatformThatIsAtLeast64CharactersLongForSecurityPurposes123!";
    const signature = crypto.createHmac('sha256', secret).update(header + "." + payload).digest('base64url');
    return header + "." + payload + "." + signature;
}

async function testApi() {
    try {
        const token = createToken();
        console.log("Using Token:", token);

        const pkgsRes = await fetch('http://localhost:5000/api/admin/payments/packages', {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log("Packages Status:", pkgsRes.status);
        const pkgsData = await pkgsRes.text();
        console.log("Packages Data:", pkgsData);

        const ovRes = await fetch('http://localhost:5000/api/admin/payments/overview', {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log("Overview Status:", ovRes.status);
        const ovData = await ovRes.text();
        console.log("Overview Data:", ovData);
    } catch (err) {
        console.error("Error:", err);
    }
}
testApi();
