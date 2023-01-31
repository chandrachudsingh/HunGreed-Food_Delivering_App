import React, { useState, useEffect, useRef } from "react";
import {
  MdArrowBack,
  MdClearAll,
  MdOutlineRemove,
  MdOutlineAdd,
} from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import emptyCart from "../Images/emptyCart.svg";
import {
  setCartIsOpen,
  setCartItems,
  setUserInfo,
} from "../reducers/userSlice";
import {
  deleteAllCartItem,
  fetchUserData,
  getCartItems,
  updateCartItem,
  userCartCheckout,
} from "../utils/firebaseFunctions";

const CartContainer = ({ setIsOrderSuccessModal }) => {
  const {
    userInfo,
    cart: { isOpen, cartItems },
  } = useSelector((state) => state.userData);
  const dispatch = useDispatch();

  const [deliveryCharges, setDeliveryCharges] = useState(50);
  const [cashback, setCashback] = useState(0);
  const [isCartUpdating, setIsCartUpdating] = useState(false);
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
      setIsCartUpdating(false);
    });
  };

  const updateItemQty = async (uid, item, val) => {
    setIsCartUpdating(true);
    await updateCartItem(uid, item, val);
    fetchCartItems(uid);
  };

  const deleteCart = async (uid) => {
    setIsCartUpdating(true);
    await deleteAllCartItem(uid);
    fetchCartItems(uid);
  };

  const cartTotalPrice = () => {
    let subTotal = 0;
    let total = 0;
    let cashbackVal = 0;
    cartItems.forEach((item) => {
      subTotal += item.price * item.qty;
      if (userInfo.accountType !== "local") {
        cashbackVal += item.price * item.qty * 0.05;
      }
    });
    setCashback(Math.floor(cashbackVal));
    if (subTotal >= 500 || userInfo.accountType !== "local") {
      setDeliveryCharges(0);
    } else {
      setDeliveryCharges(50);
    }
    console.log(deliveryCharges);
    console.log(subTotal);
    console.log(userInfo.accountType);
    total = subTotal + deliveryCharges;
    subTotalRef.current.innerHTML = `<span>₹</span> ${subTotal}`;
    totalRef.current.innerHTML = `<span>₹</span> ${total}`;
  };

  const cartCheckout = async (uid, cartItems, wallet, cashback) => {
    setIsCartUpdating(true);
    await userCartCheckout(uid, cartItems, wallet, cashback);
    await deleteAllCartItem(uid);
    fetchCartItems(uid);

    // close cart
    cartContainerRef.current.classList.remove("open-cart");
    const transitionDuration =
      parseFloat(
        window
          .getComputedStyle(cartContainerRef.current)
          .getPropertyValue("transition-duration")
      ) * 1000;
    setTimeout(() => {
      dispatch(setCartIsOpen(false));
    }, transitionDuration);

    setIsOrderSuccessModal(true);
    document.getElementById("cart-overlay").style.display = "block";
    document.getElementById("cart-overlay").style.backgroundColor =
      "rgba(0, 0, 0, 0.5)";
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
          onClick={() => deleteCart(userInfo?.uid)}
        >
          <p>clear</p>
          <MdClearAll className="clear-icon" />
        </button>
      </div>
      {cartItems && cartItems.length > 0 ? (
        <div className="cart-main">
          {isCartUpdating && (
            <div id="cart-main-overlay">
              <div className="loaderBg">
                <div className="loader"></div>
              </div>
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
                      onClick={() => updateItemQty(userInfo?.uid, item, -1)}
                    >
                      <MdOutlineRemove />
                    </button>
                    <p className="cart-item-count">{qty}</p>
                    <button
                      className="cart-item-count-btn"
                      onClick={() => updateItemQty(userInfo?.uid, item, 1)}
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
                <span>₹</span>{" "}
                {deliveryCharges === 0 && (
                  <span className="price-crossed">{50}</span>
                )}{" "}
                {deliveryCharges}
              </p>
            </div>
            {cashback !== 0 && (
              <div className="cashback-total">
                <p>cashback</p>
                <p>
                  <span>₹</span> {cashback}
                </p>
              </div>
            )}
            <div className="hr"></div>
            <div className="cart-total">
              <p>total</p>
              <p ref={totalRef}></p>
            </div>
            <button
              className="checkout-btn"
              onClick={() =>
                cartCheckout(userInfo.uid, cartItems, userInfo.wallet, cashback)
              }
            >
              check out
            </button>
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
