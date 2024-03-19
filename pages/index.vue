<template>
  <div class="py-12">
    <v-card
      class="mx-auto pa-12 pb-8 "
      elevation="8"
      max-width="448"
      rounded="lg"
    >
      <v-card-title class="text-center">เข้าสู่ระบบ</v-card-title>
      <div class="text-subtitle-1 text-medium-emphasis">Account</div>
      <v-text-field
        density="compact"
        placeholder="Email address"
        prepend-inner-icon="mdi-email-outline"
        variant="outlined"
        v-model="email"
      ></v-text-field>

      <!-- <div class="text-subtitle-1 text-medium-emphasis">password</div> -->
      <v-text-field
        :append-inner-icon="show1 ? 'mdi-eye-off' : 'mdi-eye'"
        :type="show1 ? 'text' : 'password'"
        density="compact"
        placeholder="Enter your password"
        prepend-inner-icon="mdi-lock-outline"
        variant="outlined"
        v-model="password"
      ></v-text-field>

      <v-btn
        block
        class="mb-8"
        color="#00838F"
        size="large"
        variant="tonal"
        @click="goToLogin()"
      >
        Log In
      </v-btn>
    </v-card>
  </div>
</template>

<script>
import { db } from "../plugins/firebaseInit";
import Swal from "sweetalert2";
import {
  auth,
  collection,
  addDoc,
  getDocs,
  query,
  doc,
  where,
} from "firebase/firestore";

export default {
  data() {
    return {
      email: "",
      password: "",
      show1: false,
    };
  },
  methods: {
    async goToLogin() {
      try {
        const querySnapshot = query(
          collection(db, "user"),
          where("email", "==", this.email),
          where("password", "==", this.password)
        );
        const dataUser = await getDocs(querySnapshot);
        console.log("username", this.db);

        dataUser.forEach((doc) => {
          console.log(doc.data());
        });
        if (!dataUser.empty) {
          // console.log("พบข้อมูลผู้ใช้");
          // alert("พบข้อมูลผู้ใช้");
          Swal.fire({
            position: "center",
            icon: "success",
            title: "เข้าสู่ระบบสำเร็จ",
            timer: 1500,
          });
          this.$router.push({ path: "/home" });
        } else {
          // alert("ไม่พบข้อมูลผู้ใช้");
          Swal.fire({
            icon: "warning",
            title: "ไม่พบข้อมูลผู้ใช้",
            text: "กรุณากรอกข้อมูลให้ถูกต้อง",
          });
        }
      } catch (error) {
        console.error("เกิดข้อผิดพลาดในการตรวจสอบผู้ใช้:", error);
        Swal.fire({
          icon: "warning",
          title: "ไม่พบข้อมูลผู้ใช้",
          text: "กรุณากรอกข้อมูลให้ถูกต้อง",
        });
        this.email = null;
        this.password = null;
      }
    },
  },
};
</script>

<style >
.card-center {
  justify-content: center;
  align-items: center;
  display: flex;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: aliceblue;
}


.backgroundpages {
  background-color: aliceblue;
  justify-content: center;
  align-items: center;
  /* height: calc(100vh); */
  display: table;
  width: 100%;
  display: flex;
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  padding: 1em;
  transform: scale(1.2);
}
.background {
  background-color: aliceblue !important;
}
.text-center {
  justify-content: center;
}
</style>