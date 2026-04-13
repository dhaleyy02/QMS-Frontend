const API_URL = 'https://qmsapi-production.up.railway.app/api';

async function fetchData(endpoint) {
    try {
        const response = await fetch(`${API_URL}/${endpoint}`);
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || `HTTP ${response.status}: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`❌ fetchData ${endpoint}:`, error);
        throw error;
    }
}

async function postData(endpoint, data) {
    try {
        const response = await fetch(`${API_URL}/${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || `POST failed: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`❌ postData ${endpoint}:`, error);
        throw error;
    }
}

async function putData(endpoint, data) {
    try {
        // 🆕 DEBUG: Log what we're sending
        console.log(`🔍 PUT ${endpoint}:`, {
            userId: data.userId,
            hasSignature: !!data.signatureData,
            sigDataLen: data.signatureData?.length || 0,
            sigImgLen: data.signatureImage?.length || 0
        });

        const response = await fetch(`${API_URL}/${endpoint}`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(data)  // ✅ Sends ALL fields including signature
        });

        const result = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(result.message || `PUT failed: ${response.status}`);
        }

        console.log(`✅ PUT ${endpoint} success:`, result);
        return result;  // ✅ Return the updated user
    } catch (error) {
        console.error(`❌ putData ${endpoint}:`, error);
        throw error;
    }
}

async function deleteData(endpoint) {
    try {
        const response = await fetch(`${API_URL}/${endpoint}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('DELETE failed');
        return true;
    } catch (error) {
        console.error(`❌ deleteData ${endpoint}:`, error);
        throw error;
    }
}

// ✅ Upload file with form data
async function uploadFile(formData) {
    try {
        const response = await fetch(`${API_URL}/Document/upload`, {
            method: 'POST',
            body: formData
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || 'Upload failed');
        }
        return await response.json();
    } catch (error) {
        console.error('❌ uploadFile:', error);
        throw error;
    }
}

function getUser() {
    try {
        return JSON.parse(localStorage.getItem('user') || '{}');
    } catch {
        return null;
    }
}

function logout() {
    localStorage.removeItem('user');
    window.location.href = '../login.html';
}

function checkAuth() {
    const user = getUser();
    if (!user || !user.userId) {
        logout();
        return null;
    }
    return user;
}

// ✅ Shared hash function - used by both login and register
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashBytes = new Uint8Array(hashBuffer);
    let binary = '';
    for (let i = 0; i < hashBytes.length; i++) {
        binary += String.fromCharCode(hashBytes[i]);
    }
    return btoa(binary);
}

// ✅ Upload template with file
async function uploadTemplate(formData) {
    const response = await fetch(`${API_URL}/Template/upload`, {
        method: 'POST',
        body: formData
    });

    if (!response.ok) {
        const errorText = await response.text(); // 👈 get real backend error
        throw new Error(`Upload failed: ${errorText}`);
    }

    return await response.json();
}

// ✅ Send chat message
async function sendMessage(senderId, receiverId, messageText) {
    const response = await fetch(`${API_URL}/Message/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            senderId,
            receiverId,
            messageText,
            isSystem: false
        })
    });
    if (!response.ok) throw new Error('Send failed');
    return await response.json();
}

// ✅ Send chat file
async function sendMessageFile(formData) {
    const response = await fetch(`${API_URL}/Message/send-file`, {
        method: 'POST',
        body: formData
    });
    if (!response.ok) throw new Error('Send failed');
    return await response.json();
}

// ✅ Get unread message count
async function getUnreadMessages(userId) {
    const response = await fetch(`${API_URL}/Message/unread/${userId}`);
    const data = await response.json();
    return data.count;
}

// ✅ Get unread notification count
async function getUnreadNotifications(userId) {
    const response = await fetch(`${API_URL}/Notification/unread/${userId}`);
    const data = await response.json();
    return data.count;
}