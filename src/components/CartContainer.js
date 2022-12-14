import React, { useState, useEffect, useRef } from "react";
import {
  MdArrowBack,
  MdClearAll,
  MdOutlineRemove,
  MdOutlineAdd,
} from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import emptyCart from "../Images/emptyCart.svg";
import { setCartIsOpen, setCartItems } from "../reducers/userSlice";
import {
  deleteAllCartItem,
  getCartItems,
  updateCartItem,
} from "../utils/firebaseFunctions";

const CartContainer = () => {
  const {
    user,
    cart: { isOpen, cartItems },
  } = useSelector((state) => state.userData);
  const dispatch = useDispatch();

  const deliveryCharges = 50;
  const [isItemsUpdating, setIsItemsUpdating] = useState(false);
  const cartContainerRef = useRef();
  const subTotalRef = useRef();
  const totalRef = useRef();

  const closeCart = () => {
    cartContainerRef.current.classList.remove("open-cart");
    document.getElementById("cart-overlay").style.backgroundColor =
      "rgba(0, 0, 0, 0)";

    const transitionDuration =
      parseFloat(
        window
          .getComputedStyle(cartContainerRef.current)
          .getPropertyValue("transition-duration")
      ) * 1000;
    setTimeout(() => {
      dispatch(setCartIsOpen(false));
      document.getElementById("cart-overlay").style.display = "none";
    }, transitionDuration);
  };

  const fetchCartItems = async (uid) => {
    await getCartItems(uid).then((data) => {
      dispatch(setCartItems(data));
      setIsItemsUpdating(false);
    });
  };

  const updateItemQty = async (uid, item, val) => {
    setIsItemsUpdating(true);
    await updateCartItem(uid, item, val);
    fetchCartItems(uid);
  };

  const deleteCart = async (uid) => {
    setIsItemsUpdating(true);
    await deleteAllCartItem(uid);
    fetchCartItems(uid);
  };

  const cartTotalPrice = () => {
    let subTotal = 0;
    let total = 0;
    cartItems.forEach((item) => {
      subTotal += item.price * item.qty;
    });
    total = subTotal + deliveryCharges;
    subTotalRef.current.innerHTML = `<span>₹</span> ${subTotal}`;
    totalRef.current.innerHTML = `<span>₹</span> ${total}`;
  };

  useEffect(() => {
    if (subTotalRef.current && totalRef.current) {
      cartTotalPrice();
    }
  }, [cartItems]);

  return (
    <aside
      className={`cart-container ${isOpen && "open-cart"}`}
      ref={cartContainerRef}
    >
      <div className="cart-header">
        <button className="close-cart-btn" onClick={closeCart}>
          <MdArrowBack />
        </button>
        <h3 className="cart-heading">cart</h3>
        <button
          className="clear-cart-btn"
          onClick={() => deleteCart(user?.uid)}
        >
          <p>clear</p>
          <MdClearAll className="clear-icon" />
        </button>
      </div>
      {cartItems && cartItems.length > 0 ? (
        <div className="cart-main">
          {isItemsUpdating && (
            <div id="cart-main-overlay">
              <div className="loader"></div>
            </div>
          )}
          <div className="cart-items-container">
            {cartItems.map((item) => {
              const { id, title, imageURL, price, qty } = item;
              return (
                <div className="cart-item" key={id}>
                  <div className="cart-item-img">
                    <img src={imageURL} alt="" />
                  </div>
                  <div className="cart-item-info">
                    <p className="cart-item-name">{title}</p>
                    <p className="cart-item-price">
                      <span>₹</span> {price * qty}
                    </p>
                  </div>
                  <div className="cart-item-quantity">
                    <button
                      className="cart-item-count-btn"
                      onClick={() => updateItemQty(user?.uid, item, -1)}
                    >
                      <MdOutlineRemove />
                    </button>
                    <p className="cart-item-count">{qty}</p>
                    <button
                      className="cart-item-count-btn"
                      onClick={() => updateItemQty(user?.uid, item, 1)}
                    >
                      <MdOutlineAdd />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="cart-checkout">
            <div className="sub-total">
              <p>sub total</p>
              <p ref={subTotalRef}></p>
            </div>
            <div className="delivery-charge">
              <p>delivery</p>
              <p>
                <span>₹</span> {deliveryCharges}
              </p>
            </div>
            <div className="hr"></div>
            <div className="cart-total">
              <p>total</p>
              <p ref={totalRef}></p>
            </div>
            <button className="checkout-btn">check out</button>
          </div>
        </div>
      ) : (
        <div className="empty-cart-container">
          <img src={emptyCart} alt="" />
          <p>Add some item to your cart</p>
        </div>
      )}
    </aside>
  );
};

export default CartContainer;
