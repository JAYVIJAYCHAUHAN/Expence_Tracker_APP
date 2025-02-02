<template>
    <div class="container mt-5">
        <div class="card mx-auto shadow-" style="max-width: 400px">
            <div class="card-body">
                <div class="text-center fs-4 mb-4">Login</div>
                <el-form :model="formValues"
                 ref="loginForm" :rules="validationRules" label-position="top">
                    <el-form-item label="Email" prop="email">
                        <el-input v-model="formValues.email" id="email" placeholder="Enter your email"></el-input>
                    </el-form-item>
                    <el-form-item label="Password" prop="password">
                        <el-input id="password" type="password" v-model="formValues.password"
                            placeholder="Enter your password" show-password></el-input>
                    </el-form-item>
                    <el-button type="primary" @click="handleLogin" :loading="isSubmitting" class="w-100">
                    </el-button>
                </el-form>
            </div>
        </div>
    </div>
</template>

<script>
import { ref } from 'vue';

export default {
    setup() {
        const isSubmitting = ref(false);
        const loginForm = ref();
        const formValues = ref({
            email: "",
            password: "",
        })
        const validationRules = {
            email: [
                { required: true, message: "Please enter your email", trigger: "blur" },
                { type: "email", message: "Invalid email format", trigger: "blur" },
            ],
            password: [
                {
                    required: true,
                    message: "Please enter your password",
                    trigger: "blur"
                }
            ]
        };
        async function handleLogin() {
            try {
                await loginForm.value.validate();
                isSubmitting.value = true;
                const response = await fetch("http://localhost:8000/api/users/login", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(formValues.value),
                })
                if (!response.ok) {
                    throw new Error(`Error :${response.statusText}`);
                }
                const data = await response.json();
                alert("Login SuccessFul!");
                console.log(data);
                localStorage.setItem("user", JSON.stringify(data.user))
            }
            catch (error) {
                alert(error.message || "Login failed!");
            }
            finally {
                isSubmitting.value = false;
                formValues.value = { email: "", password: "" };
            }
        }
        return {
            formValues,
            validationRules,
            isSubmitting,
            loginForm,
            handleLogin
        }
    }
}
</script>
<style scoped>
.card {
    border-radius: 10px;
}
</style>