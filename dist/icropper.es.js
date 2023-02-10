const O = Math.PI / 180, N = (r) => r * O, V = (r) => r / O, $ = (r) => (r = r % 360, Math.sign(r) < 0 ? r + 360 : r), M = (r) => {
  switch (r) {
    case 0:
    case 180:
      return 0;
    case 90:
      return 1;
    case 270:
      return -1;
    default:
      return Math.sin(N(r));
  }
}, A = (r) => {
  switch (r) {
    case 0:
      return 1;
    case 180:
      return -1;
    case 90:
    case 270:
      return 0;
    default:
      return Math.cos(N(r));
  }
};
class G {
  constructor(t, e = "degree") {
    this._degree = 0, this._radian = 0, this._sin = 0, this._cos = 0, this.set(t, e);
  }
  get degree() {
    return this._degree;
  }
  get radian() {
    return this._radian;
  }
  get sin() {
    return this._sin;
  }
  get cos() {
    return this._cos;
  }
  set(t, e = "degree") {
    e === "radian" ? (this._radian = t, this._degree = V(t)) : (this._degree = t, this._radian = N(t));
    const s = $(this._degree);
    this._sin = M(s), this._cos = A(s);
  }
}
class h {
  constructor(t = 0, e = 0) {
    this.x = 0, this.y = 0, typeof t == "object" ? (this.x = t.x, this.y = t.y) : (this.x = t, this.y = e);
  }
  add(t) {
    return new h(this.x + t.x, this.y + t.y);
  }
  subtract(t) {
    return new h(this.x - t.x, this.y - t.y);
  }
  multiply(t) {
    return new h(this.x * t.x, this.y * t.y);
  }
  divide(t) {
    return new h(this.x / t.x, this.y / t.y);
  }
  interpolate(t, e = 0.5) {
    return e = Math.max(Math.min(1, e), 0), new h(this.x + (t.x - this.x) * e, this.y + (t.y - this.y) * e);
  }
  flipX() {
    return new h(-this.x, this.y);
  }
  flipY() {
    return new h(this.x, -this.y);
  }
  distanceFrom(t = k) {
    const e = this.x - t.x, s = this.y - t.y;
    return Math.sqrt(e * e + s * s);
  }
  midPointFrom(t) {
    return this.interpolate(t);
  }
  rotate(t, e = k) {
    t = $(t);
    const s = M(t), i = A(t), a = this.subtract(e);
    return new h(a.x * i - a.y * s, a.x * s + a.y * i).add(e);
  }
  convertSystem(t, e = k) {
    t = $(t);
    const s = M(t), i = A(t), a = this.x * i - this.y * s, n = this.x * s + this.y * i;
    return new h(a, n).add(e);
  }
}
const k = new h(0, 0);
function x(r, t) {
  Object.entries(t).forEach(([e, s]) => r.style.setProperty(e, s));
}
function j(r, t) {
  const e = r + Math.atan2(t.y, t.x) / (Math.PI / 180) + 360;
  return Math.round(e % 360 / 45);
}
function v(r, t) {
  var s;
  const e = document.createElement(r);
  return (s = t == null ? void 0 : t.classList) != null && s.length && e.classList.add(...t.classList), t != null && t.style && x(e, t.style), e;
}
function I(r, t, e) {
  return Math.max(t, Math.min(r, e));
}
function P(r) {
  const { left: t, top: e, width: s, height: i, angle: a } = r, n = s / 2, o = i / 2, c = new h({ x: t, y: e });
  return {
    tl: c,
    mt: new h({ x: n, y: 0 }).rotate(a).add(c),
    tr: new h({ x: s, y: 0 }).rotate(a).add(c),
    mr: new h({ x: s, y: o }).rotate(a).add(c),
    br: new h({ x: s, y: i }).rotate(a).add(c),
    mb: new h({ x: n, y: i }).rotate(a).add(c),
    bl: new h({ x: 0, y: i }).rotate(a).add(c),
    ml: new h({ x: 0, y: o }).rotate(a).add(c)
  };
}
class y {
  constructor(t) {
    this.visible = !0, this.actionName = "", this.angle = 0, this.x = 0, this.y = 0, this.offsetX = 0, this.offsetY = 0, this.cursorStyle = "default", Object.assign(this, t), this.element = this.createElement(), this.render();
  }
  actionHandler(t) {
  }
  mouseDownHandler(t) {
  }
  mouseUpHandler(t) {
  }
  cursorStyleHandler(t, e) {
    return e.cursorStyle;
  }
  createElement() {
    var e;
    (e = this.element) == null || e.remove();
    const t = v("div");
    return this.visible || x(t, { display: "none" }), t;
  }
  render() {
    this.element && (this.visible || x(this.element, { display: "none" }), this.element.setAttribute("data-action-name", this.actionName), x(this.element, {
      left: `${(this.x + 1) * 50}%`,
      top: `${(this.y + 1) * 50}%`,
      transform: `translate3d(-50%, -50%, 0) translate3d(${this.offsetX}px, ${this.offsetY}px, 0) rotate(${this.angle}deg)`
      // cursor: this.cursorStyle,
    }));
  }
}
const T = ["e", "se", "s", "sw", "w", "nw", "n", "ne", "e"];
function q() {
  const r = "http://www.w3.org/2000/svg", t = document.createElementNS(r, "svg");
  t.setAttribute("viewBox", "0 0 32 32"), t.setAttribute("width", "32"), t.setAttribute("height", "32"), t.setAttribute("style", "display: block");
  const e = document.createElementNS(r, "path");
  return e.setAttribute("d", "M16 24 V16 H24"), e.setAttribute("fill", "none"), e.setAttribute("stroke", "#fff"), e.setAttribute("stroke-width", "4"), e.setAttribute("stroke-linecap", "round"), e.setAttribute("stroke-linejoin", "round"), e.setAttribute("filter", "drop-shadow(0 0 2px rgba(37, 43, 49, 0.75))"), t.appendChild(e), t;
}
const W = {
  tl: { classList: ["ra-corner", "tl"] },
  mt: { classList: ["md-corner", "mt"] },
  tr: { classList: ["ra-corner", "tr"] },
  mr: { classList: ["md-corner", "mr"] },
  br: { classList: ["ra-corner", "br"] },
  mb: { classList: ["md-corner", "mb"] },
  bl: { classList: ["ra-corner", "bl"] },
  ml: { classList: ["md-corner", "ml"] }
};
function E(r) {
  return () => {
    const t = v("div", { classList: W[r].classList });
    return t.appendChild(q()), t;
  };
}
function X(r) {
  return () => v("div", { classList: W[r].classList });
}
class Y {
  constructor() {
    this.transform = "";
  }
  get value() {
    return this.transform;
  }
  translate3d(t = 0, e = 0, s = 0) {
    return this.transform += `translate3d(${t}px, ${e}px, ${s}px) `, this;
  }
  rotate(t) {
    return this.transform += `rotate(${t}deg) `, this;
  }
  scaleX(t) {
    return this.transform += `scaleX(${t}) `, this;
  }
  scaleY(t) {
    return this.transform += `scaleY(${t}) `, this;
  }
  matrix(t) {
    return this.transform += `matrix(${t[0]},${t[1]},${t[2]},${t[3]},${t[4]},${t[5]})`, this;
  }
}
class Q {
  constructor() {
    this.controls = {
      tl: new y({ x: -1, y: -1, angle: 0, createElement: E("tl"), actionName: "crop" }),
      tr: new y({ x: 1, y: -1, angle: 90, createElement: E("tr"), actionName: "crop" }),
      br: new y({ x: 1, y: 1, angle: 180, createElement: E("br"), actionName: "crop" }),
      bl: new y({ x: -1, y: 1, angle: 270, createElement: E("bl"), actionName: "crop" }),
      ml: new y({ x: -1, y: 0, angle: 90, createElement: X("ml"), actionName: "crop" }),
      mr: new y({ x: 1, y: 0, angle: 90, createElement: X("mr"), actionName: "crop" }),
      mt: new y({ x: 0, y: -1, angle: 0, createElement: X("mt"), actionName: "crop" }),
      mb: new y({ x: 0, y: 1, angle: 0, createElement: X("mb"), actionName: "crop" })
    }, this.imageLoad = () => {
    }, this.imageError = (t) => {
    }, this.onImageLoad = () => this.imageLoad(), this.onImageError = (t) => this.imageError(t), this.render = async (t, e, s, i) => {
      this.elements.image.src = t, this.elements.upper.setAttribute("data-action-cursor", "move"), this.elements.upper.setAttribute("data-action-name", "move"), await new Promise((a, n) => {
        this.imageLoad = a, this.imageError = n;
      }), x(this.elements.root, {
        width: `${e.width}px`,
        height: `${e.height}px`,
        transform: new Y().matrix([
          i.cos * e.scaleX,
          i.sin * e.scaleX,
          -i.sin * e.scaleY,
          i.cos * e.scaleY,
          e.left,
          e.top
        ]).value
      }), x(this.elements.upper, {
        width: `${e.width * e.scaleX}px`,
        height: `${e.height * e.scaleY}px`,
        transform: new Y().scaleX(1 / e.scaleX).scaleY(1 / e.scaleY).value
      }), x(this.elements.image, {
        width: `${s.width}px`,
        height: `${s.height}px`,
        transform: new Y().translate3d(-e.cropX, -e.cropY).scaleX(e.flipX ? -1 : 1).scaleY(e.flipY ? -1 : 1).value
      }), Object.entries(this.controls).forEach(([a, n]) => {
        var o;
        n.cursorStyle = T[j(e.angle, n)] + "-resize", (o = n.element) == null || o.setAttribute("data-action-cursor", n.cursorStyle), n.render();
      });
    }, this.elements = this.createElement();
  }
  get element() {
    return this.elements.root;
  }
  createElement() {
    var a;
    const t = v("div", { classList: ["image-cropper-crop"] }), e = v("div", { classList: ["fcc-lower-box"] }), s = v("img", { classList: ["lower-crop-image"] });
    s.addEventListener("load", this.onImageLoad), s.addEventListener("error", this.onImageError), e.appendChild(s);
    const i = v("div", { classList: ["fcc-upper-box"] });
    for (const n in this.controls) {
      const o = (a = this.controls[n]) == null ? void 0 : a.element;
      o && (o.setAttribute("data-crop-corner", n), i.appendChild(o));
    }
    return t.append(e, i), { root: t, image: s, lower: e, upper: i };
  }
}
class U {
  constructor() {
    this.controls = {
      tl: new y({ x: -1, y: -1, angle: 0, createElement: E("tl"), actionName: "scale" }),
      tr: new y({ x: 1, y: -1, angle: 90, createElement: E("tr"), actionName: "scale" }),
      br: new y({ x: 1, y: 1, angle: 180, createElement: E("br"), actionName: "scale" }),
      bl: new y({ x: -1, y: 1, angle: 270, createElement: E("bl"), actionName: "scale" }),
      ml: new y({ visible: !1, x: -1, y: 0, angle: 90, createElement: X("ml"), actionName: "scale" }),
      mr: new y({ visible: !1, x: 1, y: 0, angle: 90, createElement: X("mr"), actionName: "scale" }),
      mt: new y({ visible: !1, x: 0, y: -1, angle: 0, createElement: X("mt"), actionName: "scale" }),
      mb: new y({ visible: !1, x: 0, y: 1, angle: 0, createElement: X("mb"), actionName: "scale" })
    }, this.imageLoad = () => {
    }, this.imageError = (t) => {
    }, this.onImageLoad = () => this.imageLoad(), this.onImageError = (t) => this.imageError(t), this.render = async (t, e, s, i) => {
      this.elements.image.src = t, this.elements.upper.setAttribute("data-action-cursor", "move"), this.elements.upper.setAttribute("data-action-name", "move"), await new Promise((a, n) => {
        this.imageLoad = a, this.imageError = n;
      }), x(this.elements.root, {
        width: `${s.width}px`,
        height: `${s.height}px`,
        transform: new Y().matrix([
          i.cos * e.scaleX,
          i.sin * e.scaleX,
          -i.sin * e.scaleY,
          i.cos * e.scaleY,
          s.left,
          s.top
        ]).value
      }), x(this.elements.upper, {
        width: `${s.width * e.scaleX}px`,
        height: `${s.height * e.scaleY}px`,
        transform: new Y().scaleX(1 / e.scaleX).scaleY(1 / e.scaleY).value
      }), x(this.elements.image, {
        transform: new Y().scaleX(e.flipX ? -1 : 1).scaleY(e.flipY ? -1 : 1).value
      }), Object.entries(this.controls).forEach(([a, n]) => {
        var o;
        n.cursorStyle = T[j(e.angle, n)] + "-resize", (o = n.element) == null || o.setAttribute("data-action-cursor", n.cursorStyle), n.render();
      });
    }, this.elements = this.createElement();
  }
  get element() {
    return this.elements.root;
  }
  createElement() {
    var n;
    const t = v("div", { classList: ["image-cropper-source"] }), e = v("div", { classList: ["fcd-lower-box"] }), s = v("img", { classList: ["fcd-lower-image"] });
    s.addEventListener("load", this.onImageLoad), s.addEventListener("error", this.onImageError), e.appendChild(s);
    const i = v("div", { classList: ["fcc-upper-box"] }), a = v("div", { classList: ["fcc-upper-box-border"] });
    i.appendChild(a);
    for (const o in this.controls) {
      const c = (n = this.controls[o]) == null ? void 0 : n.element;
      c && (c.setAttribute("data-scale-corner", o), i.appendChild(c));
    }
    return t.append(e, i), { root: t, image: s, lower: e, upper: i, border: a };
  }
}
var L = /* @__PURE__ */ ((r) => (r.tl = "br", r.br = "tl", r.tr = "bl", r.bl = "tr", r.ml = "mr", r.mr = "ml", r.mt = "mb", r.mb = "mt", r))(L || {});
function Z(r) {
  const { pointer: t, cropData: e, cropCoords: s, sourceData: i, sourceCoords: a, corner: n } = r, o = e.angle, c = s[L[n]], l = t.subtract(c).rotate(-o), p = new h(a[n]).subtract(c).rotate(-o), d = Math.sign(l.x) === Math.sign(p.x) ? Math.abs(l.x) : 0, g = Math.sign(l.y) === Math.sign(p.y) ? Math.abs(l.y) : 0;
  let m = I(d, 0, Math.abs(p.x)), u = I(g, 0, Math.abs(p.y));
  const C = {
    tl: () => ({ x: -m, y: -u }),
    bl: () => ({ x: -m, y: 0 }),
    tr: () => ({ x: 0, y: -u }),
    br: () => ({ x: 0, y: 0 }),
    ml: () => ({ x: -m, y: -(u = e.height * e.scaleY) / 2 }),
    mr: () => ({ x: 0, y: -(u = e.height * e.scaleY) / 2 }),
    mt: () => ({ x: -(m = e.width * e.scaleX) / 2, y: -u }),
    mb: () => ({ x: -(m = e.width * e.scaleX) / 2, y: 0 })
  }, b = new h(C[n]()).rotate(o).add(c), w = b.subtract(a.tl).rotate(-o);
  return {
    cropData: {
      ...e,
      left: b.x,
      top: b.y,
      width: m / e.scaleX,
      height: u / e.scaleY,
      cropX: w.x / e.scaleX,
      cropY: w.y / e.scaleY
    }
  };
}
const J = (r) => {
  const { pointer: t, cropData: e, cropCoords: s, sourceData: i } = r, a = e.width * e.scaleX, n = e.height * e.scaleY, o = i.width * e.scaleX, c = i.height * e.scaleY, l = a - o, p = n - c, d = t.subtract(s.tl).rotate(-e.angle), g = t.subtract(s.br).rotate(180 - e.angle), m = {
    tl: { x: 0, y: 0 },
    bl: { x: 0, y: p },
    br: { x: l, y: p },
    tr: { x: l, y: 0 },
    l: { x: 0, y: d.y },
    t: { x: d.x, y: 0 },
    r: { x: l, y: d.y },
    b: { x: d.x, y: p }
  }, u = d.y > 0 ? "t" : g.y > c ? "b" : "", C = d.x > 0 ? "l" : g.x > o ? "r" : "", b = m[u + C], w = b ? new h(b).rotate(e.angle).add(s.tl) : t, f = new h(s.tl).subtract(w).rotate(-e.angle);
  return {
    cropData: { ...e, cropX: f.x / e.scaleX, cropY: f.y / e.scaleY },
    sourceData: { ...i, left: w.x, top: w.y }
  };
};
var z = /* @__PURE__ */ ((r) => (r[r.tl = 0] = "tl", r[r.tr = 0] = "tr", r[r.br = -90] = "br", r[r.bl = -90] = "bl", r[r.ml = 90] = "ml", r[r.mr = 90] = "mr", r[r.mt = 0] = "mt", r[r.mb = 0] = "mb", r))(z || {});
function K(r) {
  const { pointer: t, sourceCoords: e, cropData: s, sourceData: i, cropCoords: a, corner: n } = r, o = s.angle, c = e[L[n]], l = i.width * s.scaleX, p = i.height * s.scaleY, d = new h(e[L[n]]).subtract(e[n]).rotate(-o), g = Math.asin(p * Math.sign(d.x) / d.distanceFrom()) / (Math.PI / 180) + z[n], m = d.rotate(-g), u = t.subtract(c).rotate(-o - g), C = new h(a[n]).subtract(c).rotate(-o), b = Math.max(Math.abs(u.x) / Math.abs(m.x), Math.abs(C.x) / l, Math.abs(C.y) / p);
  let w = l * b, f = p * b;
  const S = {
    tl: () => ({ x: -w, y: -f }),
    br: () => ({ x: 0, y: 0 }),
    tr: () => ({ x: 0, y: -f }),
    bl: () => ({ x: -w, y: 0 }),
    ml: () => ({ x: -w, y: -f / 2 }),
    mr: () => ({ x: 0, y: -f / 2 }),
    mt: () => ({ x: -w / 2, y: -f }),
    mb: () => ({ x: -w / 2, y: 0 })
  }[n](), D = new h(S).rotate(o).add(c), _ = D.subtract(a.tl).rotate(-o).flipX().flipY(), H = s.scaleX * b, R = s.scaleY * b;
  return {
    cropData: {
      ...s,
      cropX: _.x / H,
      cropY: _.y / R,
      scaleX: H,
      scaleY: R,
      width: Math.abs(s.width) / b,
      height: Math.abs(s.height) / b
    },
    sourceData: { ...i, left: D.x, top: D.y }
  };
}
function B(r) {
  var t;
  return +(((t = r.match(/(\d*.?\d*)px/)) == null ? void 0 : t[1]) || 0);
}
class F {
  constructor(t, e) {
    this.container = t, this.cropChangeCallbacks = /* @__PURE__ */ new Set(), this.actionHandlerCallbacks = /* @__PURE__ */ new Set(), this.cropConfirmCallbacks = /* @__PURE__ */ new Set(), this.cropCancelCallbacks = /* @__PURE__ */ new Set(), this.sourceRenderer = new U(), this.cropRenderer = new Q(), this.actionCursor = {}, this.cropStarted = !1, this.src = "", this.containerOffsetX = 0, this.containerOffsetY = 0, this.visible = !1, this.actionHandler = async (s) => {
      var b, w;
      const { action: i, target: a, corner: n } = this.event || {};
      if (!i || !this.cropStarted)
        return;
      const { cropData: o, cropCoords: c, sourceData: l, sourceCoords: p } = this, d = this.getPointer(s);
      let g, m;
      if (i === "moving") {
        const f = new h(
          l.left + (d.x - (((b = this.startPoint) == null ? void 0 : b.x) || d.x)),
          l.top + (d.y - (((w = this.startPoint) == null ? void 0 : w.y) || d.y))
        ), S = J({ pointer: f, cropData: o, cropCoords: c, sourceData: l });
        g = S.cropData, m = S.sourceData;
      } else if (i === "scale" && n) {
        if (a === this.cropRenderer)
          g = Z({ pointer: d, cropData: o, cropCoords: c, sourceData: l, sourceCoords: p, corner: n }).cropData;
        else if (a === this.sourceRenderer) {
          const f = K({ pointer: d, cropData: o, cropCoords: c, sourceData: l, sourceCoords: p, corner: n });
          g = f.cropData, m = f.sourceData;
        }
      }
      this.actionCropData = g, this.actionSourceData = m, await Promise.all([
        this.cropRenderer.render(this.src, g || o, m || l, this.angle),
        this.sourceRenderer.render(this.src, g || o, m || l, this.angle)
      ]);
      const u = { ...g || o }, C = { ...m || l };
      u.flipX && (u.cropX = C.width - u.width - u.cropX), u.flipY && (u.cropY = C.height - u.height - u.cropY), this.actionHandlerCallbacks.forEach((f) => f(u, C));
    }, Object.assign(this, e), this._element = this.createElement(), this._element.append(this.sourceRenderer.element, this.cropRenderer.element), t.appendChild(this._element), this._element.addEventListener("mouseover", (s) => {
      var i;
      s.stopPropagation(), this.actionCursor.over = ((i = s.target) == null ? void 0 : i.getAttribute("data-action-cursor")) || "", x(this.container, { cursor: this.actionCursor.down || this.actionCursor.over });
    }), this._element.addEventListener("mousedown", (s) => {
      var a, n, o, c;
      s.stopPropagation(), this.actionCursor.down = ((a = s.target) == null ? void 0 : a.getAttribute("data-action-cursor")) || "", x(this.container, { cursor: this.actionCursor.down });
      const i = (n = s.target) == null ? void 0 : n.getAttribute("data-action-name");
      if (i === "move")
        this.startPoint = this.getPointer(s), this.event = { e: s, action: "moving" }, this.setCoords();
      else if (i === "scale") {
        const l = (o = s.target) == null ? void 0 : o.getAttribute("data-scale-corner");
        this.event = { e: s, action: "scale", corner: l, target: this.sourceRenderer }, this.setCoords();
      } else if (i === "crop") {
        const l = (c = s.target) == null ? void 0 : c.getAttribute("data-crop-corner");
        this.event = { e: s, action: "scale", corner: l, target: this.cropRenderer }, this.setCoords();
      } else
        this.cancel();
    }), this._element.addEventListener("dblclick", () => {
      this.confirm();
    }), this._element.addEventListener("mouseup", () => {
      this.actionCursor.down = "", x(this.container, { cursor: this.actionCursor.down || this.actionCursor.over });
    }), document.addEventListener("mousemove", this.actionHandler), document.addEventListener("mouseup", (s) => {
      this.event = { e: s }, this.actionCropData && (this.cropData = this.actionCropData), this.actionSourceData && (this.sourceData = this.actionSourceData);
    });
  }
  get element() {
    return this._element;
  }
  getPointer(t) {
    const e = this._element.getBoundingClientRect(), s = window.getComputedStyle(this._element), i = e.width ? B(s.width) / e.width : 1, a = e.height ? B(s.height) / e.height : 1;
    return new h((t.clientX - e.left) * i, (t.clientY - e.top) * a);
  }
  createElement() {
    const { borderLeftWidth: t, borderTopWidth: e, border: s, width: i, height: a, position: n } = window.getComputedStyle(this.container);
    return v("div", {
      classList: ["image-cropper-container"],
      style: {
        display: this.visible ? "block" : "none",
        position: n !== "static" ? "absolute" : "relative",
        left: `${this.containerOffsetX}px`,
        top: `${this.containerOffsetY}px`,
        width: i,
        height: a,
        border: s,
        "border-left-width": t,
        "border-top-width": e
      }
    });
  }
  cropStart() {
    x(this._element, { display: "block" }), this.cropChangeCallbacks.forEach((t) => t(!0, "crop"));
  }
  cropEnd(t) {
    this.visible || x(this._element, { display: "none" }), this.cropChangeCallbacks.forEach((e) => e(!1, t));
  }
  setData(t, e, s) {
    this.src = t, this.cropDataBackup = { ...e }, this.cropData = { ...e }, this.sourceDataBackup = { ...s }, this.sourceData = { ...s }, this.angle = new G(this.cropData.angle);
    const { cropX: i, cropY: a, scaleX: n, scaleY: o, angle: c, flipX: l, flipY: p, left: d, top: g } = this.cropData;
    this.cropData.cropX = l ? this.sourceData.width - this.cropData.width - i : i, this.cropData.cropY = p ? this.sourceData.height - this.cropData.height - a : a;
    const m = new h(-this.cropData.cropX * n, -this.cropData.cropY * o).rotate(c).add({ x: d, y: g });
    this.sourceData.left = m.x, this.sourceData.top = m.y;
  }
  async setCoords() {
    return this.cropCoords = P({
      left: this.cropData.left,
      top: this.cropData.top,
      width: this.cropData.width * this.cropData.scaleX,
      height: this.cropData.height * this.cropData.scaleY,
      angle: this.cropData.angle
    }), this.sourceCoords = P({
      left: this.sourceData.left,
      top: this.sourceData.top,
      width: this.sourceData.width * this.cropData.scaleX,
      height: this.sourceData.height * this.cropData.scaleY,
      angle: this.cropData.angle
    }), Promise.all([
      this.cropRenderer.render(this.src, this.cropData, this.sourceData, this.angle),
      this.sourceRenderer.render(this.src, this.cropData, this.sourceData, this.angle)
    ]);
  }
  async crop(t, e, s) {
    this.cropStarted = !1, this.setData(t || this.src, e || this.cropData, s || this.sourceData), await this.setCoords(), this.cropStart(), this.cropStarted = !0;
  }
  confirm() {
    this.cropEnd("confirm"), this.cropConfirmCallbacks.forEach((t) => t(this.cropData, this.sourceData));
  }
  cancel() {
    this.cropEnd("cancel"), this.cropCancelCallbacks.forEach((t) => t(this.cropDataBackup, this.sourceDataBackup));
  }
  onCropChange(t) {
    this.cropChangeCallbacks.add(t);
  }
  onCrop(t) {
    this.actionHandlerCallbacks.add(t);
  }
  onCropConfirm(t) {
    this.cropConfirmCallbacks.add(t);
  }
  onCropCancel(t) {
    this.cropCancelCallbacks.add(t);
  }
  /**
   * remove all event listeners
   */
  dispose() {
  }
}
function tt(r) {
  return r.type === "image";
}
class et {
  constructor(t) {
    this.crop = () => {
      var i;
      const e = (i = this.canvas) == null ? void 0 : i.getActiveObject();
      if (!e || !this.cropper || !tt(e))
        return;
      this.cropTarget = e;
      const s = e.toObject();
      this.cropper.crop(e.getSrc(), s, e._cropSource || s);
    }, this.canvas = t, this.init();
  }
  init() {
    var t;
    this.canvas && (this.cropper = new F(this.canvas.wrapperEl, { containerOffsetX: 2, containerOffsetY: 2 }), this.cropper.element.style.transform = "translateX(100%)", (t = this.canvas) == null || t.on("mouse:dblclick", this.crop), this.cropper.onCrop((e, s) => {
      var i, a;
      this.cropTarget && ((i = this.cropTarget) == null || i.set({ ...e, cropX: e.cropX, cropY: e.cropY }), this.cropTarget._cropSource = s, (a = this.canvas) == null || a.renderAll());
    }), this.cropper.onCropCancel((e) => {
      var s, i;
      (s = this.cropTarget) == null || s.set({ ...e, cropX: e.cropX, cropY: e.cropY }), (i = this.canvas) == null || i.renderAll();
    }));
  }
  dispose(t) {
    var e;
    (e = this.canvas) == null || e.off("mouse:dblclick", this.crop), this.canvas = t, this.init();
  }
  confirm() {
  }
  cancel() {
  }
}
const st = { ImageCropper: F, FabricCropListener: et };
export {
  et as FabricCropListener,
  F as ImageCropper,
  st as default
};
