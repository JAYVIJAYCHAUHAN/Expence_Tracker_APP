<template>
  <div class="container mt-5">
    <div class="card mx-auto shadow-" style="max-width: 400px">
      <div class="card-body">
        <h3 class="text-center mb-4">Sign Up</h3>
        <el-form
          :model="formValues"
          ref="signupForm"
          :rules="validationRules"
          label-position="top"
        >
          <el-form-item label="userName" prop="userName">
            <el-input
              id="userName"
              v-model="formValues.userName"
              placeholder="Enter your userName"
            ></el-input>
          </el-form-item>
          <el-form-item label="Email" prop="email">
            <el-input
              id="email"
              v-model="formValues.email"
              placeholder="Enter your email"
            ></el-input>
          </el-form-item>
          <el-form-item label="Password" prop="password">
            <el-input
              id="password"
              type="password"
              v-model="formValues.password"
              placeholder="Enter your password"
              show-password
            ></el-input>
          </el-form-item>
          <el-button
            type="primary"
            @click="handleSubmit"
            :loading="isSubmitting"
            class="w-100"
          >
            Sign Up
          </el-button>
        </el-form>
      </div>
    </div>
  </div>
</template>
<script>
import { ref } from "vue";

export default {
  setup() {
    const isSubmitting = ref();
    const signupForm = ref();
    const formValues = ref({
      userName: "",
      email: "",
      password: "",
    });

    const validationRules = {
      userName: [
        {
          required: true,
          message: "Please enter you userName",
          trigger: "blur",
        },
      ],
      email: [
        { required: true, message: "Please enter your email", trigger: "blur" },
        { type: "email", message: "Invalid email format", trigger: "blur" },
      ],
      password: [
        {
          required: true,
          message: "Please enter your password",
          trigger: "blur",
        },
      ],
    };

    async function handleSubmit() {
      try {
        await signupForm.value.validate();
        isSubmitting.value = true;

       const response = await fetch("http://localhost:8000/api/users/signup", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(formValues.value),
});


        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }

        const data = await response.json();
        alert("Sign Up Successful!");
        console.log(data);
        formValues.value= { userName: "", email: "", password: "" };
      } catch (error) {
        alert(error.message || "Something went wrong!");
        console.error(error);
      } finally {
        isSubmitting.value = false;
      }
    }

    return {
      formValues,
      validationRules,
      isSubmitting,
      signupForm,
      handleSubmit,
    };
  },
};
</script>
<style scoped>
.card {
  border-radius: 10px;
}
</style>
