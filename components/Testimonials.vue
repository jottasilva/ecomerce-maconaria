<template>
    <section class="testimonials">
      <div class="container">
        <h2 class="section-title">O que nossos clientes dizem</h2>
        <div class="testimonial-slider">
          <div class="testimonial">
            <p class="testimonial-text">"{{ currentTestimonial.text }}"</p>
            <p class="testimonial-author">{{ currentTestimonial.author }}</p>
          </div>
          <div class="slider-dots">
            <span 
              v-for="(testimonial, index) in testimonials" 
              :key="index"
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
        intervalId: null
      }
    },
    computed: {
      currentTestimonial() {
        return this.testimonials[this.currentIndex];
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
    padding: 80px 0;
    background-color: var(--primary);
    color: var(--white);
  }
  
  .testimonial-slider {
    max-width: 800px;
    margin: 0 auto;
  }
  
  .testimonial {
    background-color: rgba(255, 255, 255, 0.1);
    padding: 30px;
    border-radius: 10px;
    text-align: center;
    margin-bottom: 20px;
  }
  
  .testimonial-text {
    font-style: italic;
    margin-bottom: 20px;
    font-size: 18px;
  }
  
  .testimonial-author {
    font-weight: bold;
  }
  
  .slider-dots {
    display: flex;
    justify-content: center;
    gap: 10px;
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
  