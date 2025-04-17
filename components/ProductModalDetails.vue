<template>
    <div class="modal-overlay" v-if="isOpen" @click.self="close">
        <div class="modal-content">
            <button class="close-btn" @click="close">×</button>
            <div class="modal-body">
                <div class="image-gallery">
                    <div class="thumbnails-container">
                        <div class="thumbnails-sidebar">
                            <img v-for="(image, index) in productImages" :key="index" :src="image"
                                :class="{ active: selectedImageIndex === index }" @click="selectImage(index)" />
                        </div>
                    </div>
                    <div class="main-image-container">
                        <img :src="currentImage" alt="" class="main-image">
                    </div>
                </div>

                <h1>{{ product.nome }}</h1>
                <h4>{{ product.descricao }}</h4>
                <h3>Estoque: {{ product.estoque }}</h3>

                <div class="cart-actions">
                    <div class="quantity-selector">
                        <button @click="decreaseQuantity" :disabled="quantity <= 1">-</button>
                        <span>{{ quantity }}</span>
                        <button @click="increaseQuantity" :disabled="quantity >= product.estoque">+</button>
                    </div>
                    <button class="add-to-cart-btn" @click="addToCart" :disabled="product.estoque <= 0">
                        {{ product.estoque > 0 ? 'Adicionar ao Carrinho' : 'Produto Indisponível' }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'ProductModalDetails',
    props: {
        isOpen: {
            type: Boolean,
            default: false
        },
        product: {
            type: Object,
            required: true
        }
    },
    emits: ['close', 'add-to-cart'],
    data() {
        return {
            quantity: 1,
            selectedImageIndex: 0
        }
    },
    computed: {
        productImages() {
            if (this.product?.imagens?.length > 0) {
                return this.product.imagens.map(img => img.imagem);
            } else if (this.product?.imagem) {
                return [this.product.imagem];
            }
            return [];
        }
        ,
        currentImage() {
            if (this.productImages.length > 0) {
                return this.productImages[this.selectedImageIndex];
            }
            return '';
        },
   
    },
    watch: {
        product: {
            immediate: true,
            handler() {
                // Reset para a primeira imagem sempre que o produto mudar
                this.selectedImageIndex = 0;
            }
        },
        isOpen(newValue) {
            if (newValue) {
                this.quantity = 1;
                this.selectedImageIndex = 0;
            }
        },
        // Garantir que o índice nunca esteja fora dos limites
        'productImages.length': function (newLength) {
            if (this.selectedImageIndex >= newLength) {
                this.selectedImageIndex = Math.max(0, newLength - 1);
            }
        }
    },
    methods: {
        selectImage(index) {
            this.selectedImageIndex = index;
        },
        close() {
            this.$emit('close');
        },
        decreaseQuantity() {
            if (this.quantity > 1) {
                this.quantity--;
            }
        },
        increaseQuantity() {
            if (this.quantity < this.product.estoque) {
                this.quantity++;
            }
        },
        addToCart() {
            if (this.product.estoque > 0) {
                this.$emit('add-to-cart', {
                    product: this.product,
                    quantity: this.quantity
                });
                this.close();
            }
        }
    }
}
</script>

<style scoped>
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.6);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 999;
}

.modal-content {
    background-color: white;
    padding: 30px;
    border-radius: 10px;
    width: 90%;
    max-width: 600px;
    position: relative;
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
}

.close-btn {
    position: absolute;
    top: 10px;
    right: 15px;
    background: transparent;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #333;
}

.modal-body h1 {
    margin-top: 20px;
    font-size: 24px;
    color: #222;
}

.modal-body h4 {
    color: #555;
}

.modal-body h3 {
    color: #008000;
}

.image-gallery {
    display: flex;
    gap: 15px;
    margin-bottom: 20px;
}

.thumbnails-container {
    width: 80px;
    max-height: 300px;
}

.thumbnails-sidebar {
    display: flex;
    flex-direction: column;
    gap: 10px;
    max-height: 300px;
    overflow-y: auto;
}

.thumbnails-sidebar img {
    width: 70px;
    height: 70px;
    object-fit: cover;
    border: 2px solid #ddd;
    border-radius: 5px;
    cursor: pointer;
    transition: border-color 0.2s;
}

.thumbnails-sidebar img.active {
    border-color: #4a90e2;
}

.main-image-container {
    flex-grow: 1;
}

.main-image {
    width: 100%;
    height: 300px;
    object-fit: contain;
    border: 1px solid #eee;
    border-radius: 5px;
}

.cart-actions {
    margin-top: 20px;
    display: flex;
    align-items: center;
    gap: 15px;
}

.quantity-selector {
    display: flex;
    align-items: center;
    border: 1px solid #ddd;
    border-radius: 5px;
}

.quantity-selector button {
    background: #f5f5f5;
    border: none;
    width: 30px;
    height: 30px;
    font-size: 18px;
    cursor: pointer;
    color: #333;
}

.quantity-selector button:disabled {
    color: #aaa;
    cursor: not-allowed;
}

.quantity-selector span {
    padding: 0 15px;
    font-weight: bold;
}

.add-to-cart-btn {
    flex-grow: 1;
    background-color: #4a90e2;
    color: white;
    border: none;
    padding: 10px 15px;
    border-radius: 5px;
    cursor: pointer;
    font-weight: bold;
    transition: background-color 0.2s;
}

.add-to-cart-btn:hover {
    background-color: #3a7bc8;
}

.add-to-cart-btn:disabled {
    background-color: #aaa;
    cursor: not-allowed;
}

/* Responsividade para telas menores */
@media (max-width: 768px) {
    .image-gallery {
        flex-direction: column-reverse;
    }

    .thumbnails-container {
        width: 100%;
        max-height: none;
    }

    .thumbnails-sidebar {
        flex-direction: row;
        overflow-x: auto;
        overflow-y: hidden;
        max-height: none;
    }
}
</style>