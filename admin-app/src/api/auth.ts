import axios from "axios";

const BASE_URL = "http://localhost:8081/auth";

export async function adminLogin(employeeId: string, password: string) {
    try {
        const res = await axios.post(`${BASE_URL}/admin/login`, {
            employeeId,
            password
        });

        return res.data;
    } catch (err) {
        console.error("Login failed", err);
        throw err;
    }
}