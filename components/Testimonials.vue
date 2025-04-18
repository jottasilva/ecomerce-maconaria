<template>
  <section class="testimonials">
    <div class="container">
      <h2 class="section-title">O que nossos clientes dizem</h2>
      <div class="testimonial-slider">
        <div class="testimonial" v-if="currentTestimonial">
          <p class="testimonial-text">{{ currentTestimonial.testmonial }}</p>
          <p class="testimonial-author">
            {{ currentTestimonial.nome }},
            <span style="font-weight: 300; font-style: italic;">
              {{ currentTestimonial.city }}
            </span>
          </p>
          <p class="testimonial-date">{{ formattedDate }}</p>
        </div>
        <div class="slider-dots">
          <span
            v-for="(item, index) in testimonials"
            :key="item.id"
            :class="{ active: currentIndex === index }"
            @click="setActiveTestimonial(index)"
            class="dot"
          ></span>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'Testimonials',
  props: {
    testimonials: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      currentIndex: 0,
      intervalId: null,
      currentDate: new Date()
    }
  },
  computed: {
    currentTestimonial() {
      return this.testimonials[this.currentIndex];
    },
    formattedDate() {
      const meses = [
        'janeiro', 'fevereiro', 'março', 'abril', 
        'maio', 'junho', 'julho', 'agosto', 
        'setembro', 'outubro', 'novembro', 'dezembro'
      ];
      
      const dia = this.currentDate.getDate();
      const mes = meses[this.currentDate.getMonth()];
      const ano = this.currentDate.getFullYear();
      
      return `${dia} de ${mes} de ${ano}`;
    }
  },
  methods: {
    setActiveTestimonial(index) {
      this.currentIndex = index;
      this.resetInterval();
    },
    nextTestimonial() {
      this.currentIndex = (this.currentIndex + 1) % this.testimonials.length;
    },
    resetInterval() {
      clearInterval(this.intervalId);
      this.intervalId = setInterval(() => {
        this.nextTestimonial();
      }, 5000);
    }
  },
  mounted() {
    this.resetInterval();
  },
  beforeUnmount() {
    clearInterval(this.intervalId);
  }
}
</script>

<style scoped>
.testimonials {
  padding: 10px 0;
  background-color: var(--primary);
  color: var(--white);
}

.testimonial-slider {
  max-width: 900px;
  margin: 0 auto;
}

.testimonial {
  background-color: rgba(255, 255, 255, 0.1);
  padding: 30px;
  border-radius: 10px;
  text-align: center;
  margin-bottom: 60px;
  position: relative;
}

.testimonial-text {
  font-style: italic;
  margin-bottom: 20px;
  font-size: 18px;
}

.testimonial-author {
  font-weight: bold;
}

.testimonial-date {
  position: absolute;
  bottom: 10px;
  right: 15px;
  color: #ccc;
  font-size: 10px;
}

.slider-dots {
  display: flex;
  justify-content: center;
  gap: 10px;
  padding-bottom:20px ;

}

.dot {
  width: 12px;
  height: 12px;
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s;
}

.dot.active, .dot:hover {
  background-color: var(--secondary);
}
</style>