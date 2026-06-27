import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  ArrowLeft,
  Star,
  ChefHat,
  Minus,
  Plus,
  Leaf,
  Utensils,
  AlertTriangle,
} from "lucide-react";
import { useMenuItem } from "../hooks/useMenu";
import { useCart } from "../context/CartContext";
import { formatNaira } from "../utils/currency";
import toast from "react-hot-toast";

export default function MenuItemPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { item, loading } = useMenuItem(id);
  const { addItem, tableNumber, setTableNumber } = useCart();

  const [qty, setQty] = useState(1);
  const [tableInput, setTableInput] = useState(tableNumber || "");
  const [sizeLabel, setSizeLabel] = useState(null);

  const selectedSize = useMemo(() => {
    if (!item?.sizes?.length) return null;
    if (sizeLabel) {
      const found = item.sizes.find((s) => s.label === sizeLabel);
      if (found) return found;
    }
    return item.sizes[0];
  }, [item, sizeLabel]);

  if (loading)
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          paddingTop: "5rem",
          background: "var(--obsidian)",
        }}
      >
        <div className="spinner" />
      </div>
    );

  if (!item)
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          paddingTop: "5rem",
          background: "var(--obsidian)",
        }}
      >
        <Utensils
          size={48}
          style={{ color: "var(--border)", marginBottom: "1rem" }}
        />
        <p style={{ color: "var(--text-muted)" }}>Item not found.</p>
        <button
          onClick={() => navigate("/menu")}
          style={{
            marginTop: "1rem",
            color: "var(--crimson)",
            cursor: "pointer",
            background: "none",
            border: "none",
          }}
        >
          Back to Menu
        </button>
      </div>
    );

  const price = selectedSize ? selectedSize.price : item.basePrice || 0;
  const totalPrice = price * qty;

  const handleAddToCart = () => {
    if (!tableInput.trim()) {
      toast.error("Please enter your table number");
      return;
    }
    setTableNumber(tableInput);
    addItem(item, selectedSize, qty);
    toast.success(`${qty}x ${item.name} added!`, {
      style: {
        background: "var(--charcoal)",
        color: "white",
        border: "1px solid var(--crimson)",
      },
      iconTheme: { primary: "var(--crimson)", secondary: "white" },
    });
    navigate("/cart");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        paddingTop: "6rem",
        paddingBottom: "5rem",
        background: "var(--obsidian)",
      }}
    >
      <div style={{ maxWidth: "58rem", margin: "0 auto", padding: "0 1.5rem" }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
            fontSize: "0.875rem",
            color: "var(--text-muted)",
            marginBottom: "2rem",
            cursor: "pointer",
            background: "none",
            border: "none",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "white")}
          onMouseLeave={(e) =>
            (e.currentTarget.style.color = "var(--text-muted)")
          }
        >
          <ArrowLeft size={16} /> Back to Menu
        </button>

        <div
          style={{ display: "grid", gridTemplateColumns: "1fr", gap: "2.5rem" }}
          className="item-detail-grid"
        >
          {/* Image */}
          <div
            style={{
              borderRadius: "1.25rem",
              overflow: "hidden",
              height: "22rem",
              position: "relative",
              background: "var(--charcoal)",
            }}
            className="animate-scale-in"
          >
            {item.image ? (
              <img
                src={item.image}
                alt={item.name}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            ) : (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Utensils size={64} style={{ color: "var(--border)" }} />
              </div>
            )}
            <div
              style={{
                position: "absolute",
                top: "1rem",
                left: "1rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.4rem",
              }}
            >
              {item.isPopular && (
                <span
                  className="badge"
                  style={{
                    background: "var(--crimson)",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    gap: "3px",
                  }}
                >
                  <Star size={10} style={{ fill: "white" }} /> Popular
                </span>
              )}
              {item.isFeatured && (
                <span
                  className="badge"
                  style={{
                    background: "rgba(201,168,76,0.9)",
                    color: "#000",
                    display: "flex",
                    alignItems: "center",
                    gap: "3px",
                  }}
                >
                  <Star size={10} style={{ fill: "#000" }} /> Featured
                </span>
              )}
            </div>
          </div>

          {/* Details */}
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1.4rem" }}
            className="animate-fade-up"
          >
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              <span
                className="badge"
                style={{
                  background: "rgba(196,30,58,0.15)",
                  color: "var(--crimson)",
                  border: "1px solid rgba(196,30,58,0.3)",
                }}
              >
                {item.category}
              </span>
              {item.isVegetarian && (
                <span
                  className="badge"
                  style={{
                    background: "rgba(34,197,94,0.1)",
                    color: "#22c55e",
                    border: "1px solid rgba(34,197,94,0.2)",
                    display: "flex",
                    alignItems: "center",
                    gap: "3px",
                  }}
                >
                  <Leaf size={10} /> Vegetarian
                </span>
              )}
            </div>

            <div>
              <h1
                style={{
                  fontFamily: "'Playfair Display',serif",
                  fontSize: "clamp(1.75rem,4vw,2.5rem)",
                  fontWeight: 700,
                  color: "white",
                  lineHeight: 1.2,
                }}
              >
                {item.name}
              </h1>
              <p
                style={{
                  marginTop: "0.75rem",
                  lineHeight: 1.8,
                  fontSize: "0.95rem",
                  color: "var(--text-secondary)",
                }}
              >
                {item.description}
              </p>
            </div>

            {item.sizes?.length > 0 && (
              <div>
                <p
                  style={{
                    fontSize: "0.7rem",
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    color: "var(--text-muted)",
                    marginBottom: "0.75rem",
                  }}
                >
                  Choose Portion
                </p>
                <div
                  style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}
                >
                  {item.sizes.map((s) => (
                    <button
                      key={s.label}
                      onClick={() => setSizeLabel(s.label)}
                      style={{
                        padding: "0.6rem 1.2rem",
                        borderRadius: "999px",
                        fontSize: "0.85rem",
                        fontWeight: 500,
                        cursor: "pointer",
                        transition: "all 0.2s",
                        background:
                          selectedSize?.label === s.label
                            ? "var(--crimson)"
                            : "var(--muted)",
                        border: `1px solid ${selectedSize?.label === s.label ? "var(--crimson)" : "var(--border)"}`,
                        color:
                          selectedSize?.label === s.label
                            ? "white"
                            : "var(--text-secondary)",
                      }}
                    >
                      {s.label} – {formatNaira(s.price)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {item.prepTime > 0 && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  fontSize: "0.875rem",
                  color: "var(--text-muted)",
                }}
              >
                <ChefHat size={14} style={{ color: "var(--crimson)" }} /> Ready
                in ~{item.prepTime} minutes
              </div>
            )}

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.7rem",
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: "var(--text-muted)",
                  marginBottom: "0.5rem",
                }}
              >
                Table Number *
              </label>
              <input
                value={tableInput}
                onChange={(e) => setTableInput(e.target.value)}
                placeholder="e.g. Table 5"
                className="input-dark"
              />
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <p
                  style={{
                    fontSize: "0.7rem",
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    color: "var(--text-muted)",
                    marginBottom: "0.6rem",
                  }}
                >
                  Quantity
                </p>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                  }}
                >
                  <button
                    className="qty-btn"
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                  >
                    <Minus size={14} />
                  </button>
                  <span
                    style={{
                      fontWeight: 700,
                      fontSize: "1.25rem",
                      color: "white",
                      width: "2rem",
                      textAlign: "center",
                    }}
                  >
                    {qty}
                  </span>
                  <button
                    className="qty-btn"
                    style={{ background: "var(--crimson)" }}
                    onClick={() => setQty((q) => q + 1)}
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <p
                  style={{
                    fontSize: "0.7rem",
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    color: "var(--text-muted)",
                    marginBottom: "0.25rem",
                  }}
                >
                  Total
                </p>
                <p
                  style={{
                    fontFamily: "'Playfair Display',serif",
                    fontSize: "2rem",
                    fontWeight: 700,
                    color: "var(--crimson)",
                  }}
                >
                  {formatNaira(totalPrice)}
                </p>
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              className="btn-crimson"
              style={{
                width: "100%",
                padding: "1rem",
                borderRadius: "14px",
                fontSize: "1rem",
                gap: "0.6rem",
              }}
            >
              <ShoppingBag size={18} /> Add to Order
            </button>

            {item.allergens?.length > 0 && (
              <p
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  fontSize: "0.75rem",
                  color: "var(--text-muted)",
                }}
              >
                <AlertTriangle size={12} style={{ color: "#f59e0b" }} />{" "}
                Contains: {item.allergens.join(", ")}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
