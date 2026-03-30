import { createContext, useContext, useReducer } from 'react';

const CartContext = createContext(null);

const initialState = {
  items: [],
  promoCode: '',
  promoDiscount: 0,
  orderType: 'dine-in', // 'dine-in' | 'takeaway'
  tableNumber: '7',
  specialInstructions: '',
};

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { item, quantity, modifiers, modifierPrice } = action.payload;
      const existingIndex = state.items.findIndex(
        (i) => i.id === item.id && JSON.stringify(i.modifiers) === JSON.stringify(modifiers)
      );
      if (existingIndex >= 0) {
        const updated = [...state.items];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
        };
        return { ...state, items: updated };
      }
      return {
        ...state,
        items: [
          ...state.items,
          {
            cartId: `${item.id}-${Date.now()}`,
            id: item.id,
            name: item.name,
            price: item.price + modifierPrice,
            basePrice: item.price,
            modifierPrice,
            modifiers,
            image: item.image,
            quantity,
            isVeg: item.isVeg,
          },
        ],
      };
    }
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter((i) => i.cartId !== action.payload.cartId) };
    case 'UPDATE_QUANTITY': {
      const { cartId, quantity } = action.payload;
      if (quantity <= 0) {
        return { ...state, items: state.items.filter((i) => i.cartId !== cartId) };
      }
      return {
        ...state,
        items: state.items.map((i) => (i.cartId === cartId ? { ...i, quantity } : i)),
      };
    }
    case 'CLEAR_CART':
      return { ...state, items: [], promoCode: '', promoDiscount: 0 };
    case 'APPLY_PROMO':
      return { ...state, promoCode: action.payload.code, promoDiscount: action.payload.discount };
    case 'SET_ORDER_TYPE':
      return { ...state, orderType: action.payload };
    case 'SET_TABLE':
      return { ...state, tableNumber: action.payload };
    case 'SET_INSTRUCTIONS':
      return { ...state, specialInstructions: action.payload };
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  const subtotal = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = Math.round(subtotal * 0.05);
  const discount = state.promoDiscount;
  const total = subtotal + tax - discount;
  const itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);

  const addToCart = (item, quantity = 1, modifiers = [], modifierPrice = 0) => {
    dispatch({ type: 'ADD_ITEM', payload: { item, quantity, modifiers, modifierPrice } });
  };
  const removeFromCart = (cartId) => dispatch({ type: 'REMOVE_ITEM', payload: { cartId } });
  const updateQuantity = (cartId, quantity) =>
    dispatch({ type: 'UPDATE_QUANTITY', payload: { cartId, quantity } });
  const clearCart = () => dispatch({ type: 'CLEAR_CART' });
  const applyPromo = (code, discount) =>
    dispatch({ type: 'APPLY_PROMO', payload: { code, discount } });
  const setOrderType = (type) => dispatch({ type: 'SET_ORDER_TYPE', payload: type });
  const setTable = (table) => dispatch({ type: 'SET_TABLE', payload: table });
  const setInstructions = (instructions) =>
    dispatch({ type: 'SET_INSTRUCTIONS', payload: instructions });

  return (
    <CartContext.Provider
      value={{
        ...state,
        subtotal,
        tax,
        discount,
        total,
        itemCount,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        applyPromo,
        setOrderType,
        setTable,
        setInstructions,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
