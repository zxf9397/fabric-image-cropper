var D = /* @__PURE__ */ ((r) => (r.BorderName = "data-border-name", r.ActionName = "data-action-name", r.ActionCursor = "data-action-cursor", r.ActionCorner = "data-action-corner", r))(D || {}), L = /* @__PURE__ */ ((r) => (r.Move = "move", r.Moving = "moving", r.Scale = "scale", r.Scaling = "scaling", r.Crop = "crop", r.Cropping = "cropping", r))(L || {});
const T = 2, k = "tomato", S = {
  angle: 0,
  left: 0,
  top: 0,
  width: 0,
  height: 0,
  scaleX: 1,
  scaleY: 1,
  flipX: !1,
  flipY: !1,
  cropX: 0,
  cropY: 0
}, _ = {
  width: 0,
  height: 0
}, U = {
  left: 0,
  top: 0,
  width: 0,
  height: 0
}, re = {
  width: 32,
  height: 32,
  lineWidth: 4,
  strokeWidth: 2,
  lineLength: 8,
  fill: "#fff",
  stroke: "#cccc"
}, Z = Math.PI / 180, P = (r) => r * Z, ie = (r) => r / Z, O = (r) => (r = r % 360, Math.sign(r) < 0 ? r + 360 : r), j = (r) => {
  switch (r) {
    case 0:
    case 180:
      return 0;
    case 90:
      return 1;
    case 270:
      return -1;
    default:
      return Math.sin(P(r));
  }
}, W = (r) => {
  switch (r) {
    case 0:
      return 1;
    case 180:
      return -1;
    case 90:
    case 270:
      return 0;
    default:
      return Math.cos(P(r));
  }
};
function oe(r, e) {
  const t = r + Math.atan2(e.y, e.x) / (Math.PI / 180) + 360;
  return Math.round(t % 360 / 45);
}
class ne {
  constructor(e, t = "degree") {
    this._degree = 0, this._radian = 0, this._sin = 0, this._cos = 0, this.set(e, t);
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
  set(e, t = "degree") {
    t === "radian" ? (this._radian = e, this._degree = ie(e)) : (this._degree = e, this._radian = P(e));
    const s = O(this._degree);
    this._sin = j(s), this._cos = W(s);
  }
}
class l {
  constructor(e = 0, t = 0) {
    this.x = 0, this.y = 0, typeof e == "object" ? (this.x = e.x, this.y = e.y) : (this.x = e, this.y = t);
  }
  add(e) {
    return new l(this.x + e.x, this.y + e.y);
  }
  subtract(e) {
    return new l(this.x - e.x, this.y - e.y);
  }
  multiply(e) {
    return new l(this.x * e.x, this.y * e.y);
  }
  divide(e) {
    return new l(this.x / e.x, this.y / e.y);
  }
  interpolate(e, t = 0.5) {
    return t = Math.max(Math.min(1, t), 0), new l(this.x + (e.x - this.x) * t, this.y + (e.y - this.y) * t);
  }
  flipX() {
    return new l(-this.x, this.y);
  }
  flipY() {
    return new l(this.x, -this.y);
  }
  distanceFrom(e = M) {
    const t = this.x - e.x, s = this.y - e.y;
    return Math.sqrt(t * t + s * s);
  }
  midPointFrom(e) {
    return this.interpolate(e);
  }
  rotate(e, t = M) {
    e = O(e);
    const s = j(e), i = W(e), o = this.subtract(t);
    return new l(o.x * i - o.y * s, o.x * s + o.y * i).add(t);
  }
  convertSystem(e, t = M) {
    e = O(e);
    const s = j(e), i = W(e), o = this.x * i - this.y * s, n = this.x * s + this.y * i;
    return new l(o, n).add(t);
  }
}
const M = new l(0, 0);
function w(r, e) {
  Object.entries(e).forEach(([t, s]) => r.style.setProperty(t, s));
}
function V(r, e, t) {
  return Math.max(e, Math.min(r, t));
}
function C(r, e) {
  return Object.fromEntries(
    Object.entries(r).map(([t, s]) => {
      const i = e[t];
      return [t, i ?? s];
    })
  );
}
function z(r) {
  let { left: e, top: t, width: s, height: i, angle: o = 0, scaleX: n = 1, scaleY: c = 1 } = r;
  s *= n, i *= c;
  const h = s / 2, d = i / 2, a = new l({ x: e, y: t });
  return {
    tl: a,
    mt: new l({ x: h, y: 0 }).rotate(o).add(a),
    tr: new l({ x: s, y: 0 }).rotate(o).add(a),
    mr: new l({ x: s, y: d }).rotate(o).add(a),
    br: new l({ x: s, y: i }).rotate(o).add(a),
    mb: new l({ x: h, y: i }).rotate(o).add(a),
    bl: new l({ x: 0, y: i }).rotate(o).add(a),
    ml: new l({ x: 0, y: d }).rotate(o).add(a)
  };
}
function G(r) {
  var e;
  return +(((e = r.match(/(\d*.?\d*)px/)) == null ? void 0 : e[1]) || 0);
}
const J = "http://www.w3.org/2000/svg";
function q(r, e, t) {
  const s = document.createElementNS(J, "path");
  return s.setAttribute("d", r), s.setAttribute("fill", "none"), s.setAttribute("stroke", `${e}`), s.setAttribute("stroke-width", `${t}`), s.setAttribute("stroke-linecap", "round"), s.setAttribute("stroke-linejoin", "round"), s;
}
function ce() {
  const { width: r, height: e, lineWidth: t, lineLength: s, strokeWidth: i, fill: o, stroke: n } = re, c = document.createElementNS(J, "svg");
  c.setAttribute("viewBox", `0 0 ${r} ${e}`), c.setAttribute("width", `${r}`), c.setAttribute("height", `${e}`), c.setAttribute("style", "display: block");
  const { x: h, y: d } = { x: r / 2, y: e / 2 }, a = `M${h} ${d + s} V${d} H${h + s}`, p = q(a, n, t + i), m = q(a, o, t);
  return c.append(p, m), { svg: c, strokePath: p, fillPath: m };
}
const ae = ["e", "se", "s", "sw", "w", "nw", "n", "ne", "e"];
function f(r, e) {
  var s;
  const t = document.createElement(r);
  return (s = e == null ? void 0 : e.classList) != null && s.length && t.classList.add(...e.classList.filter((i) => !!i)), e != null && e.className && t.classList.add(e.className), e != null && e.style && w(t, e.style), t;
}
const K = {
  tl: "ic-corner-ctrl",
  mt: "ic-middle-ctrl",
  tr: "ic-corner-ctrl",
  mr: "ic-middle-ctrl",
  br: "ic-corner-ctrl",
  mb: "ic-middle-ctrl",
  bl: "ic-corner-ctrl",
  ml: "ic-middle-ctrl"
};
function X(r) {
  return () => {
    const e = f("div", { className: K[r] }), { svg: t } = ce();
    return e.appendChild(t), e;
  };
}
function Y(r) {
  return () => f("div", { className: K[r] });
}
function Q(r, e) {
  return typeof r == "number" ? r + e : r;
}
class A {
  constructor() {
    this.transform = "";
  }
  get value() {
    return this.transform;
  }
  translate(e = 0, t = 0) {
    return this.transform += `translate(${Q(e, "px")}, ${Q(t, "px")}) `, this;
  }
  rotate(e) {
    return this.transform += `rotate(${e}deg) `, this;
  }
  scaleX(e) {
    return this.transform += `scaleX(${e}) `, this;
  }
  scaleY(e) {
    return this.transform += `scaleY(${e}) `, this;
  }
  matrix(e) {
    return this.transform += `matrix(${e[0]},${e[1]},${e[2]},${e[3]},${e[4]},${e[5]}) `, this;
  }
}
class $ {
  constructor(e) {
    this.borderName = "", this.x = 0, this.y = 0, this.width = "0", this.height = "0", this.color = k, this.scaleX = 1, this.scaleY = 1, Object.assign(this, e), this.element = this.createElement();
  }
  createElement() {
    return f("div", { className: "ic-border", style: this.getRenderStyle() });
  }
  getRenderStyle() {
    return {
      left: `${(1 + this.x) * 50}%`,
      top: `${(1 + this.y) * 50}%`,
      width: `${this.width || 0}`,
      height: `${this.height || 0}`,
      "background-color": this.color || k,
      transform: new A().translate("-50%", "-50%").scaleX(this.scaleX).scaleY(this.scaleY).value
    };
  }
  actionHandler() {
    return this;
  }
  render() {
    Object.assign(this, this.actionHandler()), this.element.setAttribute(D.BorderName, this.borderName), w(this.element, this.getRenderStyle());
  }
}
class he {
  constructor(e) {
    this.src = "", this.resolve = (t) => {
    }, this.reject = (t) => {
    }, this.handleLoad = () => this.element ? this.resolve(this.element) : this.reject(new Event("error")), this.setImage(e);
  }
  removeEventListener() {
    var e, t, s;
    (e = this.element) == null || e.removeEventListener("load", this.handleLoad), (t = this.element) == null || t.removeEventListener("error", this.reject), (s = this.element) == null || s.removeEventListener("abort", this.reject);
  }
  setImage(e = "") {
    typeof e == "string" ? (this.src = e, this.element || (this.element = new Image())) : (this.src = e.src, this.element = e), this.removeEventListener(), this.element.addEventListener("load", this.handleLoad), this.element.addEventListener("error", this.reject), this.element.addEventListener("abort", this.reject), this.element.src = this.src;
  }
  async getImage() {
    return new Promise((e, t) => {
      this.resolve = e, this.reject = t;
    });
  }
  remove() {
    var e;
    this.removeEventListener(), (e = this.element) == null || e.remove();
  }
}
class ee {
  constructor(e) {
    this.borderWidth = T, this.borderColor = k, this.domScaleX = 1, this.domScaleY = 1, this.imageLoader = new he(), this.controls = {}, this.borders = {
      mt: new $({
        y: -1,
        actionHandler: () => ({ scaleY: this.domScaleY, width: "100%", height: `${this.borderWidth}px`, color: this.borderColor }),
        borderName: "top"
      }),
      mr: new $({
        x: 1,
        actionHandler: () => ({ scaleX: this.domScaleX, width: `${this.borderWidth}px`, height: "100%", color: this.borderColor }),
        borderName: "right"
      }),
      mb: new $({
        y: 1,
        actionHandler: () => ({ scaleY: this.domScaleY, width: "100%", height: `${this.borderWidth}px`, color: this.borderColor }),
        borderName: "bottom"
      }),
      ml: new $({
        x: -1,
        actionHandler: () => ({ scaleX: this.domScaleX, width: `${this.borderWidth}px`, height: "100%", color: this.borderColor }),
        borderName: "left"
      })
    }, this.render = async (t) => {
      this.imageLoader.setImage(t.src), await this.imageLoader.getImage(), this.renderBefore(t), Object.entries(this.controls).forEach(([s, i]) => {
        var o;
        i.cursorStyle = ae[oe(t.croppedData.angle, i)] + "-resize", i.scaleX = this.domScaleX, i.scaleY = this.domScaleY, (o = i.element) == null || o.setAttribute(D.ActionCursor, i.cursorStyle), i.render();
      });
      for (const s in this.borders) {
        const i = this.borders[s];
        i == null || i.render();
      }
    }, Object.assign(this, e), this.elements = this.createElement(), this.imageLoader.setImage(this.elements.image), this.addBordersAndControls();
  }
  get element() {
    return this.elements.container;
  }
  createElement() {
    const e = f("div"), t = f("div"), s = f("img"), i = f("div");
    return { container: e, lower: t, image: s, upper: i };
  }
  addBordersAndControls() {
    var t, s;
    const e = document.createDocumentFragment();
    for (const i in this.borders) {
      const o = (t = this.borders[i]) == null ? void 0 : t.element;
      o && e.appendChild(o);
    }
    for (const i in this.controls) {
      const o = (s = this.controls[i]) == null ? void 0 : s.element;
      o && (o.setAttribute(D.ActionCorner, i), e.appendChild(o));
    }
    this.elements.upper.appendChild(e);
  }
  renderBefore(e) {
  }
}
class y {
  constructor(e) {
    this.actionName = "", this.x = 0, this.y = 0, this.visible = !0, this.angle = 0, this.offsetX = 0, this.offsetY = 0, this.scaleX = 1, this.scaleY = 1, this.cursorStyle = "default", Object.assign(this, e), this._element = this.createElement(), this.render();
  }
  get element() {
    return this._element;
  }
  createElement() {
    var t;
    (t = this._element) == null || t.remove();
    const e = f("div");
    return this.visible || w(e, { display: "none" }), e;
  }
  getRenderStyle() {
    return {
      left: `${(this.x + 1) * 50}%`,
      top: `${(this.y + 1) * 50}%`,
      transform: new A().translate("-50%", "-50%").translate(this.offsetX, this.offsetY).scaleX(this.scaleX).scaleY(this.scaleY).rotate(this.angle).value
    };
  }
  render() {
    this._element && (this.visible || w(this._element, { display: "none" }), this._element.setAttribute(D.ActionName, this.actionName), w(this._element, this.getRenderStyle()));
  }
}
class le extends ee {
  constructor() {
    super(), this.controls = {
      tl: new y({ x: -1, y: -1, angle: 0, createElement: X("tl"), actionName: "crop" }),
      tr: new y({ x: 1, y: -1, angle: 90, createElement: X("tr"), actionName: "crop" }),
      br: new y({ x: 1, y: 1, angle: 180, createElement: X("br"), actionName: "crop" }),
      bl: new y({ x: -1, y: 1, angle: 270, createElement: X("bl"), actionName: "crop" }),
      ml: new y({ x: -1, y: 0, angle: 90, createElement: Y("ml"), actionName: "crop" }),
      mr: new y({ x: 1, y: 0, angle: 90, createElement: Y("mr"), actionName: "crop" }),
      mt: new y({ x: 0, y: -1, angle: 0, createElement: Y("mt"), actionName: "crop" }),
      mb: new y({ x: 0, y: 1, angle: 0, createElement: Y("mb"), actionName: "crop" })
    }, this.addBordersAndControls();
  }
  createElement() {
    const e = f("div", { classList: ["ic-crop-container"] }), t = f("div", { classList: ["ic-crop-lower"] }), s = f("img", { classList: ["ic-crop-image"] });
    t.append(s);
    const i = f("div", { classList: ["ic-crop-upper"] });
    return e.append(t, i), { container: e, lower: t, image: s, upper: i };
  }
  renderBefore(e) {
    const { croppedData: t, sourceData: s, angle: i, croppedBackup: o } = e;
    this.elements.upper.setAttribute(D.ActionCursor, "move"), this.elements.upper.setAttribute(D.ActionName, "move");
    const n = t.width / o.width, c = t.height / o.height, h = t.scaleX * n, d = t.scaleY * c, a = {
      width: `${o.width}px`,
      height: `${o.height}px`,
      transform: new A().matrix([
        i.cos * h,
        i.sin * h,
        -i.sin * d,
        i.cos * d,
        t.left,
        t.top
      ]).value
    };
    w(this.elements.lower, a), w(this.elements.upper, a), w(this.elements.image, {
      width: `${s.width}px`,
      height: `${s.height}px`,
      transform: new A().translate(
        -((t.cropX - (t.flipX ? s.width : 0)) / n),
        -((t.cropY - (t.flipY ? s.height : 0)) / c)
      ).scaleX((t.flipX ? -1 : 1) / n).scaleY((t.flipY ? -1 : 1) / c).value
    }), this.domScaleX = 1 / h, this.domScaleY = 1 / d;
  }
}
class de extends ee {
  constructor(e) {
    super(e), this.controls = {
      tl: new y({ x: -1, y: -1, angle: 0, createElement: X("tl"), actionName: "scale" }),
      tr: new y({ x: 1, y: -1, angle: 90, createElement: X("tr"), actionName: "scale" }),
      br: new y({ x: 1, y: 1, angle: 180, createElement: X("br"), actionName: "scale" }),
      bl: new y({ x: -1, y: 1, angle: 270, createElement: X("bl"), actionName: "scale" }),
      ml: new y({ visible: !1, x: -1, y: 0, angle: 90, createElement: Y("ml"), actionName: "scale" }),
      mr: new y({ visible: !1, x: 1, y: 0, angle: 90, createElement: Y("mr"), actionName: "scale" }),
      mt: new y({ visible: !1, x: 0, y: -1, angle: 0, createElement: Y("mt"), actionName: "scale" }),
      mb: new y({ visible: !1, x: 0, y: 1, angle: 0, createElement: Y("mb"), actionName: "scale" })
    }, this.addBordersAndControls();
  }
  createElement() {
    const e = f("div", { classList: ["ic-source-container"] }), t = f("div", { classList: ["ic-source-lower"] }), s = f("img", { classList: ["ic-source-image"] });
    t.appendChild(s);
    const i = f("div", { classList: ["ic-source-upper"] });
    return e.append(t, i), { container: e, lower: t, image: s, upper: i };
  }
  renderBefore(e) {
    const { croppedData: t, sourceData: s, angle: i } = e;
    this.elements.upper.setAttribute(D.ActionCursor, "move"), this.elements.upper.setAttribute(D.ActionName, "move");
    const o = t.scaleX, n = t.scaleY, c = {
      width: `${s.width}px`,
      height: `${s.height}px`,
      transform: new A().matrix([
        i.cos * t.scaleX,
        i.sin * t.scaleX,
        -i.sin * t.scaleY,
        i.cos * t.scaleY,
        s.left,
        s.top
      ]).value
    };
    w(this.elements.lower, c), w(this.elements.upper, c), w(this.elements.image, {
      transform: new A().scaleX(t.flipX ? -1 : 1).scaleY(t.flipY ? -1 : 1).value
    }), this.domScaleX = 1 / o, this.domScaleY = 1 / n;
  }
}
var R = /* @__PURE__ */ ((r) => (r.tl = "br", r.br = "tl", r.tr = "bl", r.bl = "tr", r.ml = "mr", r.mr = "ml", r.mt = "mb", r.mb = "mt", r))(R || {});
function pe(r) {
  const { pointer: e, croppedData: t, croppedControlCoords: s, sourceData: i, sourceControlCoords: o, corner: n } = r, c = t.angle, h = s[R[n]], d = e.subtract(h).rotate(-c), a = new l(o[n]).subtract(h).rotate(-c), p = Math.sign(d.x) === Math.sign(a.x) ? Math.abs(d.x) : 0, m = Math.sign(d.y) === Math.sign(a.y) ? Math.abs(d.y) : 0;
  let g = V(p, 16, Math.abs(a.x)), u = V(m, 16, Math.abs(a.y));
  const E = {
    tl: () => ({ x: -g, y: -u }),
    bl: () => ({ x: -g, y: 0 }),
    tr: () => ({ x: 0, y: -u }),
    br: () => ({ x: 0, y: 0 }),
    ml: () => ({ x: -g, y: -(u = t.height * t.scaleY) / 2 }),
    mr: () => ({ x: 0, y: -(u = t.height * t.scaleY) / 2 }),
    mt: () => ({ x: -(g = t.width * t.scaleX) / 2, y: -u }),
    mb: () => ({ x: -(g = t.width * t.scaleX) / 2, y: 0 })
  }, b = new l(E[n]()).rotate(c).add(h), v = b.subtract(o.tl).rotate(-c);
  return {
    croppedData: {
      ...t,
      left: b.x,
      top: b.y,
      width: g / t.scaleX,
      height: u / t.scaleY,
      cropX: v.x / t.scaleX,
      cropY: v.y / t.scaleY
    },
    sourceData: i
  };
}
const me = (r) => {
  const { pointer: e, croppedData: t, croppedControlCoords: s, sourceData: i } = r, o = t.width * t.scaleX, n = t.height * t.scaleY, c = i.width * t.scaleX, h = i.height * t.scaleY, d = o - c, a = n - h, p = e.subtract(s.tl).rotate(-t.angle), m = e.subtract(s.br).rotate(180 - t.angle), g = {
    tl: { x: 0, y: 0 },
    bl: { x: 0, y: a },
    br: { x: d, y: a },
    tr: { x: d, y: 0 },
    l: { x: 0, y: p.y },
    t: { x: p.x, y: 0 },
    r: { x: d, y: p.y },
    b: { x: p.x, y: a }
  }, u = p.y > 0 ? "t" : m.y > h ? "b" : "", E = p.x > 0 ? "l" : m.x > c ? "r" : "", b = g[u + E], v = b ? new l(b).rotate(t.angle).add(s.tl) : e, x = new l(s.tl).subtract(v).rotate(-t.angle);
  return {
    croppedData: { ...t, cropX: x.x / t.scaleX, cropY: x.y / t.scaleY },
    sourceData: { ...i, left: v.x, top: v.y }
  };
};
var te = /* @__PURE__ */ ((r) => (r[r.tl = 0] = "tl", r[r.tr = 0] = "tr", r[r.br = -90] = "br", r[r.bl = -90] = "bl", r[r.ml = 90] = "ml", r[r.mr = 90] = "mr", r[r.mt = 0] = "mt", r[r.mb = 0] = "mb", r))(te || {});
function ue(r) {
  const { pointer: e, sourceControlCoords: t, croppedData: s, sourceData: i, croppedControlCoords: o, corner: n } = r, c = s.angle, h = t[R[n]], d = i.width * s.scaleX, a = i.height * s.scaleY, p = new l(t[R[n]]).subtract(t[n]).rotate(-c), m = Math.asin(a * Math.sign(p.x) / p.distanceFrom()) / (Math.PI / 180) + te[n], g = p.rotate(-m), u = e.subtract(h).rotate(-c - m), E = new l(o[n]).subtract(h).rotate(-c), b = Math.max(Math.abs(u.x) / Math.abs(g.x), Math.abs(E.x) / d, Math.abs(E.y) / a), v = d * b, x = a * b, N = {
    tl: () => ({ x: -v, y: -x }),
    br: () => ({ x: 0, y: 0 }),
    tr: () => ({ x: 0, y: -x }),
    bl: () => ({ x: -v, y: 0 }),
    ml: () => ({ x: -v, y: -x / 2 }),
    mr: () => ({ x: 0, y: -x / 2 }),
    mt: () => ({ x: -v / 2, y: -x }),
    mb: () => ({ x: -v / 2, y: 0 })
  }[n](), B = new l(N).rotate(c).add(h), H = B.subtract(o.tl).rotate(-c).flipX().flipY(), I = s.scaleX * b, F = s.scaleY * b;
  return {
    croppedData: {
      ...s,
      cropX: H.x / I,
      cropY: H.y / F,
      scaleX: I,
      scaleY: F,
      width: s.width / b,
      height: s.height / b
    },
    sourceData: { ...i, left: B.x, top: B.y }
  };
}
class ge {
  constructor() {
    this.listener = /* @__PURE__ */ new Map();
  }
  on(e, t) {
    const s = this.listener.get(e) || /* @__PURE__ */ new Set();
    this.listener.has(e) ? s.add(t) : this.listener.set(e, s.add(t));
  }
  off(e, t) {
    if (!e) {
      this.listener.clear();
      return;
    }
    if (t) {
      const s = this.listener.get(e);
      s && s.delete(t);
    } else
      this.listener.delete(e);
  }
  fire(e, ...t) {
    const s = this.listener.get(e);
    s && s.forEach((i) => i(...t));
  }
}
class se {
  constructor(e, t) {
    this.container = e, this.listener = new ge(), this.sourceRenderer = new de(), this.cropRenderer = new le(), this.activeCursorStyle = {}, this.cropping = !1, this.src = "", this.domListener = {
      "cropper:mouseover": (s) => {
        var i;
        s.stopPropagation(), this.activeCursorStyle.over = ((i = s.target) == null ? void 0 : i.getAttribute(D.ActionCursor)) || "", w(this.container, { cursor: this.activeCursorStyle.down || this.activeCursorStyle.over });
      },
      "cropper:mousedown": (s) => {
        var o, n;
        s.stopPropagation(), this.activeCursorStyle.down = ((o = s.target) == null ? void 0 : o.getAttribute(D.ActionCursor)) || "", w(this.container, { cursor: this.activeCursorStyle.down });
        const i = (n = s.target) == null ? void 0 : n.getAttribute(D.ActionName);
        i && this.eventCenter[i] ? (this.eventCenter[i](s), this.setCoords()) : this.cancel();
      },
      "cropper:dblclick": (s) => this.confirm(),
      "cropper:mouseup": (s) => {
        this.activeCursorStyle.down = "", w(this.container, { cursor: this.activeCursorStyle.down || this.activeCursorStyle.over });
      },
      "document:mousemove": (s) => this.actionHandler(s),
      "document:mouseup": (s) => {
        this.event = { e: s }, this.croppedTransform && (this.croppedData = { ...this.croppedTransform }), this.sourceTransform && (this.sourceData = { ...this.sourceTransform });
      }
    }, this.eventCenter = {
      move: (s) => {
        this.startPoint = this.getPointer(s), this.event = { e: s, action: L.Moving };
      },
      scale: (s) => {
        var i;
        this.event = {
          e: s,
          action: L.Scaling,
          corner: (i = s.target) == null ? void 0 : i.getAttribute(D.ActionCorner),
          target: this.sourceRenderer
        };
      },
      crop: (s) => {
        var i;
        this.event = {
          e: s,
          action: L.Cropping,
          corner: (i = s.target) == null ? void 0 : i.getAttribute(D.ActionCorner),
          target: this.sourceRenderer
        };
      },
      moving: () => {
      },
      scaling: () => {
      },
      cropping: () => {
      }
    }, this.containerOffsetX = 0, this.containerOffsetY = 0, this.borderWidth = T, this.borderColor = k, this.cancelable = !0, this.actionHandler = async (s) => {
      var b, v;
      const { action: i, corner: o } = this.event || {};
      if (!i || !this.cropping)
        return;
      const { croppedData: n, croppedControlCoords: c, sourceData: h, sourceControlCoords: d } = this, a = this.getPointer(s);
      let p, m;
      if (i === L.Moving) {
        const x = new l(
          h.left + (a.x - (((b = this.startPoint) == null ? void 0 : b.x) || a.x)),
          h.top + (a.y - (((v = this.startPoint) == null ? void 0 : v.y) || a.y))
        ), N = me({ pointer: x, croppedData: n, croppedControlCoords: c, sourceData: h });
        p = N.croppedData, m = N.sourceData;
      } else if (i === L.Cropping && o)
        p = pe({ pointer: a, croppedData: n, croppedControlCoords: c, sourceData: h, sourceControlCoords: d, corner: o }).croppedData;
      else if (i === L.Scaling && o) {
        const x = ue({ pointer: a, croppedData: n, croppedControlCoords: c, sourceData: h, sourceControlCoords: d, corner: o });
        p = x.croppedData, m = x.sourceData;
      }
      this.croppedTransform = p, this.sourceTransform = m;
      const g = {
        src: this.src,
        croppedData: p || n,
        sourceData: m || h,
        angle: this.angle,
        croppedBackup: this.croppedBackup,
        sourceBackup: this.sourceBackup
      };
      await Promise.all([this.cropRenderer.render(g), this.sourceRenderer.render(g)]);
      const u = C(S, p || n), E = C(U, m || h);
      u.flipX && (u.cropX = E.width - u.width - u.cropX), u.flipY && (u.cropY = E.height - u.height - u.cropY), this.listener.fire("cropping", u, E);
    }, Object.assign(this, t), this.cropRenderer.borderWidth = this.sourceRenderer.borderWidth = this.borderWidth || T, this.cropRenderer.borderColor = this.sourceRenderer.borderColor = this.borderColor || k, this._element = this.createElement(), this._element.append(this.sourceRenderer.element, this.cropRenderer.element), e.appendChild(this._element), this.bindEvents();
  }
  get on() {
    return this.listener.on.bind(this.listener);
  }
  get off() {
    return this.listener.off.bind(this.listener);
  }
  get element() {
    return this._element;
  }
  bindEvents() {
    this._element.addEventListener("mouseover", this.domListener["cropper:mouseover"]), this._element.addEventListener("mousedown", this.domListener["cropper:mousedown"]), this._element.addEventListener("dblclick", this.domListener["cropper:dblclick"]), this._element.addEventListener("mouseup", this.domListener["cropper:mouseup"]), document.addEventListener("mousemove", this.domListener["document:mousemove"]), document.addEventListener("mouseup", this.domListener["document:mouseup"]);
  }
  unbindEvents() {
    this._element.removeEventListener("mouseover", this.domListener["cropper:mouseover"]), this._element.removeEventListener("mousedown", this.domListener["cropper:mousedown"]), this._element.removeEventListener("dblclick", this.domListener["cropper:dblclick"]), this._element.removeEventListener("mouseup", this.domListener["cropper:mouseup"]), document.removeEventListener("mousemove", this.domListener["document:mousemove"]), document.removeEventListener("mouseup", this.domListener["document:mouseup"]);
  }
  remove() {
    this.unbindEvents(), this.element.remove();
  }
  getPointer(e) {
    const t = this._element.getBoundingClientRect(), s = window.getComputedStyle(this._element), i = t.width ? G(s.width) / t.width : 1, o = t.height ? G(s.height) / t.height : 1;
    return new l((e.clientX - t.left) * i, (e.clientY - t.top) * o);
  }
  createElement() {
    const { borderLeftWidth: e, borderTopWidth: t, border: s, width: i, height: o, position: n } = window.getComputedStyle(this.container);
    return f("div", {
      classList: ["ic-container"],
      style: {
        display: this.cancelable ? "none" : "block",
        position: n !== "static" ? "absolute" : "relative",
        left: `${this.containerOffsetX}px`,
        top: `${this.containerOffsetY}px`,
        width: i,
        height: o,
        border: s,
        "border-left-width": e,
        "border-top-width": t
      }
    });
  }
  setCropperVisibility(e) {
    w(this._element, { display: this.cancelable ? e ? "block" : "none" : "block" });
  }
  setData(e, t, s) {
    this.src = e, this.croppedBackup = C(S, t), this.sourceBackup = C(_, s), this.croppedData = C(S, t), this.sourceData = C(U, s), this.angle = new ne(this.croppedData.angle);
    const { cropX: i, cropY: o, scaleX: n, scaleY: c, angle: h, flipX: d, flipY: a, left: p, top: m } = this.croppedData;
    this.croppedData.cropX = d ? this.sourceData.width - this.croppedData.width - i : i, this.croppedData.cropY = a ? this.sourceData.height - this.croppedData.height - o : o;
    const g = new l(-this.croppedData.cropX * n, -this.croppedData.cropY * c).rotate(h).add({ x: p, y: m });
    this.sourceData.left = g.x, this.sourceData.top = g.y;
  }
  async setCoords() {
    this.croppedControlCoords = z(this.croppedData), this.sourceControlCoords = z({
      ...this.sourceData,
      scaleX: this.croppedData.scaleX,
      scaleY: this.croppedData.scaleY,
      angle: this.croppedData.angle
    });
    const e = {
      src: this.src,
      angle: this.angle,
      croppedData: this.croppedData,
      croppedBackup: this.croppedBackup,
      sourceData: this.sourceData,
      sourceBackup: this.sourceBackup
    };
    return Promise.all([this.cropRenderer.render(e), this.sourceRenderer.render(e)]);
  }
  /**
   * Get the coordinates of the original image and other information
   */
  static getSource(e, t) {
    let { cropX: s, cropY: i, scaleX: o, scaleY: n, angle: c, flipX: h, flipY: d, left: a, top: p } = e;
    s = h ? t.width - e.width - s : s, i = d ? t.height - e.height - i : i;
    const { x: m, y: g } = new l(-s * o, -i * n).rotate(c).add({ x: a, y: p });
    return { angle: c, left: m, top: g, width: t.width, height: t.height, scaleX: o, scaleY: n, flipX: h, flipY: d };
  }
  /**
   * Start cropping
   */
  async crop(e) {
    this.cropping = !1, this.setData((e == null ? void 0 : e.src) || this.src, (e == null ? void 0 : e.cropData) || this.croppedData, (e == null ? void 0 : e.sourceData) || this.sourceData), await this.setCoords(), this.setCropperVisibility(!0), this.listener.fire("start"), this.cropping = !0;
  }
  /**
   * Confirm cropping
   */
  confirm() {
    this.setCropperVisibility(!1), this.listener.fire("end", C(S, this.croppedData), C(_, this.sourceData)), this.listener.fire("confirm", C(S, this.croppedData), C(_, this.sourceData));
  }
  /**
   * Cancel cropping
   */
  cancel() {
    this.setCropperVisibility(!1), this.listener.fire("end", C(S, this.croppedBackup), C(_, this.sourceBackup)), this.listener.fire("cancel", C(S, this.croppedBackup), C(_, this.sourceBackup));
  }
}
function fe(r) {
  return r.type === "image";
}
class be {
  constructor(e) {
    this.crop = () => {
      var i;
      const t = (i = this.canvas) == null ? void 0 : i.getActiveObject();
      if (!t || !this.cropper || !fe(t))
        return;
      this.cropTarget = t;
      const s = t.toObject();
      this.cropper.crop({ src: t.getSrc(), cropData: s, sourceData: t._cropSource || s });
    }, this.canvas = e, this.init();
  }
  init() {
    var e;
    this.canvas && (this.cropper = new se(this.canvas.wrapperEl, { containerOffsetX: 2, containerOffsetY: 2, borderColor: "purple" }), this.cropper.element.style.transform = "translateX(100%)", (e = this.canvas) == null || e.on("mouse:dblclick", this.crop), this.cropper.on("cropping", (t, s) => {
      var i;
      this.cropTarget && (this.cropTarget.set({ ...t, cropX: t.cropX, cropY: t.cropY }), this.cropTarget._cropSource = s, (i = this.canvas) == null || i.renderAll());
    }), this.cropper.on("cancel", (t) => {
      var s, i;
      (s = this.cropTarget) == null || s.set({ ...t, cropX: t.cropX, cropY: t.cropY }), (i = this.canvas) == null || i.renderAll();
    }), this.cropper.on("start", () => {
      var t, s;
      (t = this.canvas) == null || t.discardActiveObject(), (s = this.canvas) == null || s.renderAll();
    }), this.cropper.on("end", () => {
      var t, s;
      this.cropTarget && ((t = this.canvas) == null || t.setActiveObject(this.cropTarget)), (s = this.canvas) == null || s.renderAll();
    }));
  }
  dispose(e) {
    var t;
    (t = this.canvas) == null || t.off("mouse:dblclick", this.crop), this.canvas = e, this.init();
  }
  remove() {
    var e, t, s;
    (e = this.canvas) == null || e.off("mouse:dblclick", this.crop), (t = this.cropper) == null || t.off(), (s = this.cropper) == null || s.remove();
  }
  confirm() {
    var e;
    (e = this.cropper) == null || e.confirm();
  }
  cancel() {
    var e;
    (e = this.cropper) == null || e.cancel();
  }
}
const ye = { ImageCropper: se, FabricCropListener: be };
export {
  be as FabricCropListener,
  se as ImageCropper,
  ye as default
};
