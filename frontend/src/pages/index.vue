
<template>
  <main class="container">
    <h1 class="text-h3 mb-5">
      🚀 CLO - The Future of Learning Outcomes Assessment! 🎓
    </h1>

    <VDivider class="mb-5" />

    <h2 class="text-h5 mb-5">
      🎯 Project Overview
    </h2>
    <p>Ever wondered if there’s a smarter way to track student progress? Look no further! <b>SmartLO</b> is a <b>web-based application</b> designed to revolutionize <b>Learning Outcomes (LO) assessment</b> at <b>Politeknik Negeri Batam</b>. By shifting to an <b>outcome-based</b> approach, this system makes evaluations <b>more objective, accurate, and insightful</b>—helping both students and faculty recognize achievements with clarity! 🌟</p>

    <h2 class="text-h5 mb-5">
      🛠 How It Works
    </h2>
    <p>Using the <b>Rapid Application Development (RAD) 🚀</b> methodology, we built this system through <b>quick iterations</b>, ensuring <b>user-friendly</b> features that truly meet the needs of instructors and students.</p>

    <h2 class="text-h5 mb-5">
      🌟 Key Features
    </h2>
    <ul
      class="mb-5"
      style="list-style: none;"
    >
      <li>✅ <b>Automated LO assessments</b> - Say goodbye to manual grading! 📝💨</li>
      <li>✅ <b>Real-time performance tracking</b> - Instant insights at your fingertips! 📊🔍</li>
      <li>✅ <b>Seamless faculty dashboard</b> - Making evaluations smooth & stress-free! 🖥️⚡</li>
      <li>✅ <b>Student-friendly interface</b> - Know where you stand with just a click! 🎯🎓</li>
    </ul>

    <h2 class="text-h5 mb-5">
      📈 Why It Matters
    </h2>
    <p>By <b>digitizing and centralizing</b> LO assessments, <b>SmartLO</b> saves time, enhances accuracy, and lets faculty focus on what truly matters—<b>teaching and student growth!</b> 🚀💡</p>

    <h2 class="text-h5 mb-5">
      🔮 Future Plans
    </h2>
    <p>Oh yes! We`re looking to integrate advanced <b>analytics 📊</b>, AI-driven insights 🤖, and seamless connections with <b>institutional systems</b> to make education smarter and more dynamic!</p>

    <p class="footer">
      Welcome to the future of learning assessments—efficient, engaging, and fun! 🌍🎓
    </p>
  </main>
</template>

<script setup>
const store = useVuex()

const user = computed(() => store.state.app.user)
</script>

