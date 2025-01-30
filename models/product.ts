export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  rating: number;
  reviews: number;
  isFavorite: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface FeaturedProduct {
  id: string;
  title: string;
  image: string;
  color: string;
}

export interface PopularProduct {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  rating: number;
} 