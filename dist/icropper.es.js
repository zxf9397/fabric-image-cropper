var x = /* @__PURE__ */ ((i) => (i.BorderName = "data-border-name", i.ActionName = "data-action-name", i.ActionCursor = "data-action-cursor", i.ActionCorner = "data-action-corner", i.CornerName = "data-corner-name", i))(x || {}), L = /* @__PURE__ */ ((i) => (i.Move = "move", i.Moving = "moving", i.Scale = "scale", i.Scaling = "scaling", i.Crop = "crop", i.Cropping = "cropping", i))(L || {});
const T = 2, _ = "tomato", S = {
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
}, k = {
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
}, Z = Math.PI / 180, P = (i) => i * Z, ie = (i) => i / Z, O = (i) => (i = i % 360, Math.sign(i) < 0 ? i + 360 : i), j = (i) => {
  switch (i) {
    case 0:
    case 180:
      return 0;
    case 90:
      return 1;
    case 270:
      return -1;
    default:
      return Math.sin(P(i));
  }
}, W = (i) => {
  switch (i) {
    case 0:
      return 1;
    case 180:
      return -1;
    case 90:
    case 270:
      return 0;
    default:
      return Math.cos(P(i));
  }
};
function oe(i, e) {
  const t = i + Math.atan2(e.y, e.x) / (Math.PI / 180) + 360;
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
    const s = j(e), r = W(e), o = this.subtract(t);
    return new l(o.x * r - o.y * s, o.x * s + o.y * r).add(t);
  }
  convertSystem(e, t = M) {
    e = O(e);
    const s = j(e), r = W(e), o = this.x * r - this.y * s, n = this.x * s + this.y * r;
    return new l(o, n).add(t);
  }
}
const M = new l(0, 0);
function w(i, e) {
  Object.entries(e).forEach(([t, s]) => i.style.setProperty(t, s));
}
function V(i, e, t) {
  return Math.max(e, Math.min(i, t));
}
function D(i, e) {
  return Object.fromEntries(
    Object.entries(i).map(([t, s]) => {
      const r = e[t];
      return [t, r ?? s];
    })
  );
}
function z(i) {
  let { left: e, top: t, width: s, height: r, angle: o = 0, scaleX: n = 1, scaleY: c = 1 } = i;
  s *= n, r *= c;
  const h = s / 2, d = r / 2, a = new l({ x: e, y: t });
  return {
    tl: a,
    mt: new l({ x: h, y: 0 }).rotate(o).add(a),
    tr: new l({ x: s, y: 0 }).rotate(o).add(a),
    mr: new l({ x: s, y: d }).rotate(o).add(a),
    br: new l({ x: s, y: r }).rotate(o).add(a),
    mb: new l({ x: h, y: r }).rotate(o).add(a),
    bl: new l({ x: 0, y: r }).rotate(o).add(a),
    ml: new l({ x: 0, y: d }).rotate(o).add(a)
  };
}
function G(i) {
  var e;
  return +(((e = i.match(/(\d*.?\d*)px/)) == null ? void 0 : e[1]) || 0);
}
const J = "http://www.w3.org/2000/svg";
function q(i, e, t) {
  const s = document.createElementNS(J, "path");
  return s.setAttribute("d", i), s.setAttribute("fill", "none"), s.setAttribute("stroke", `${e}`), s.setAttribute("stroke-width", `${t}`), s.setAttribute("stroke-linecap", "round"), s.setAttribute("stroke-linejoin", "round"), s;
}
function ce() {
  const { width: i, height: e, lineWidth: t, lineLength: s, strokeWidth: r, fill: o, stroke: n } = re, c = document.createElementNS(J, "svg");
  c.setAttribute("viewBox", `0 0 ${i} ${e}`), c.setAttribute("width", `${i}`), c.setAttribute("height", `${e}`), c.setAttribute("style", "display: block");
  const { x: h, y: d } = { x: i / 2, y: e / 2 }, a = `M${h} ${d + s} V${d} H${h + s}`, p = q(a, n, t + r), u = q(a, o, t);
  return c.append(p, u), { svg: c, strokePath: p, fillPath: u };
}
const ae = ["e", "se", "s", "sw", "w", "nw", "n", "ne", "e"];
function f(i, e) {
  var s;
  const t = document.createElement(i);
  return (s = e == null ? void 0 : e.classList) != null && s.length && t.classList.add(...e.classList.filter((r) => !!r)), e != null && e.className && t.classList.add(e.className), e != null && e.style && w(t, e.style), t;
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
function Y(i) {
  return () => {
    const e = f("div", { className: K[i] }), { svg: t } = ce();
    return e.appendChild(t), e;
  };
}
function E(i) {
  return () => f("div", { className: K[i] });
}
function Q(i, e) {
  return typeof i == "number" ? i + e : i;
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
class R {
  constructor(e) {
    this.borderName = "", this.x = 0, this.y = 0, this.width = "0", this.height = "0", this.color = _, this.scaleX = 1, this.scaleY = 1, Object.assign(this, e), this.element = this.createElement();
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
      "background-color": this.color || _,
      transform: new A().translate("-50%", "-50%").scaleX(this.scaleX).scaleY(this.scaleY).value
    };
  }
  actionHandler() {
    return this;
  }
  render() {
    Object.assign(this, this.actionHandler()), this.element.setAttribute(x.BorderName, this.borderName), w(this.element, this.getRenderStyle());
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
    this.borderWidth = T, this.borderColor = _, this.scale = 1, this.domScaleX = 1, this.domScaleY = 1, this.imageLoader = new he(), this.controls = {}, this.borders = {
      mt: new R({
        y: -1,
        actionHandler: () => ({ scaleY: this.domScaleY, width: "100%", height: `${this.borderWidth}px`, color: this.borderColor }),
        borderName: "top"
      }),
      mr: new R({
        x: 1,
        actionHandler: () => ({ scaleX: this.domScaleX, width: `${this.borderWidth}px`, height: "100%", color: this.borderColor }),
        borderName: "right"
      }),
      mb: new R({
        y: 1,
        actionHandler: () => ({ scaleY: this.domScaleY, width: "100%", height: `${this.borderWidth}px`, color: this.borderColor }),
        borderName: "bottom"
      }),
      ml: new R({
        x: -1,
        actionHandler: () => ({ scaleX: this.domScaleX, width: `${this.borderWidth}px`, height: "100%", color: this.borderColor }),
        borderName: "left"
      })
    }, this.render = async (t) => {
      this.imageLoader.setImage(t.src), await this.imageLoader.getImage(), this.renderBefore(t), Object.entries(this.controls).forEach(([s, r]) => {
        var o, n;
        r.cursorStyle = ae[oe(t.croppedData.angle, r)] + "-resize", r.scaleX = this.domScaleX, r.scaleY = this.domScaleY, (o = r.element) == null || o.setAttribute(x.CornerName, s), (n = r.element) == null || n.setAttribute(x.ActionCursor, r.cursorStyle), r.render();
      });
      for (const s in this.borders) {
        const r = this.borders[s];
        r == null || r.render();
      }
    }, Object.assign(this, e), this.elements = this.createElement(), this.imageLoader.setImage(this.elements.image), this.addBordersAndControls();
  }
  get element() {
    return this.elements.container;
  }
  createElement() {
    const e = f("div"), t = f("div"), s = f("img"), r = f("div");
    return { container: e, lower: t, image: s, upper: r };
  }
  addBordersAndControls() {
    var t, s;
    const e = document.createDocumentFragment();
    for (const r in this.borders) {
      const o = (t = this.borders[r]) == null ? void 0 : t.element;
      o && e.appendChild(o);
    }
    for (const r in this.controls) {
      const o = (s = this.controls[r]) == null ? void 0 : s.element;
      o && (o.setAttribute(x.ActionCorner, r), e.appendChild(o));
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
    if (this._element) {
      if (!this.visible) {
        w(this._element, { display: "none" });
        return;
      }
      w(this._element, { display: "block" }), this._element.setAttribute(x.ActionName, this.actionName), w(this._element, this.getRenderStyle());
    }
  }
}
class le extends ee {
  constructor() {
    super(), this.controls = {
      tl: new y({ x: -1, y: -1, angle: 0, createElement: Y("tl"), actionName: "crop" }),
      tr: new y({ x: 1, y: -1, angle: 90, createElement: Y("tr"), actionName: "crop" }),
      br: new y({ x: 1, y: 1, angle: 180, createElement: Y("br"), actionName: "crop" }),
      bl: new y({ x: -1, y: 1, angle: 270, createElement: Y("bl"), actionName: "crop" }),
      ml: new y({ x: -1, y: 0, angle: 90, createElement: E("ml"), actionName: "crop" }),
      mr: new y({ x: 1, y: 0, angle: 90, createElement: E("mr"), actionName: "crop" }),
      mt: new y({ x: 0, y: -1, angle: 0, createElement: E("mt"), actionName: "crop" }),
      mb: new y({ x: 0, y: 1, angle: 0, createElement: E("mb"), actionName: "crop" })
    }, this.addBordersAndControls();
  }
  createElement() {
    const e = f("div", { classList: ["ic-crop-container"] }), t = f("div", { classList: ["ic-crop-lower"] }), s = f("img", { classList: ["ic-crop-image"] });
    t.append(s);
    const r = f("div", { classList: ["ic-crop-upper"] });
    return e.append(t, r), { container: e, lower: t, image: s, upper: r };
  }
  renderBefore(e) {
    const { croppedData: t, sourceData: s, angle: r, croppedBackup: o } = e;
    this.elements.upper.setAttribute(x.ActionCursor, "move"), this.elements.upper.setAttribute(x.ActionName, "move");
    const n = t.width / o.width, c = t.height / o.height, h = t.scaleX * n, d = t.scaleY * c, a = {
      width: `${o.width}px`,
      height: `${o.height}px`,
      transform: new A().matrix([
        r.cos * h,
        r.sin * h,
        -r.sin * d,
        r.cos * d,
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
    }), this.domScaleX = this.scale / h, this.domScaleY = this.scale / d;
    const p = t.width * t.scaleX, u = t.height * t.scaleY;
    p < 40 * this.scale ? [this.controls.mt, this.controls.mb].map((m) => m.visible = !1) : [this.controls.mt, this.controls.mb].map((m) => m.visible = !0), u < 40 * this.scale ? [this.controls.ml, this.controls.mr].map((m) => m.visible = !1) : [this.controls.ml, this.controls.mr].map((m) => m.visible = !0);
  }
}
class de extends ee {
  constructor(e) {
    super(e), this.controls = {
      tl: new y({ x: -1, y: -1, angle: 0, createElement: Y("tl"), actionName: "scale" }),
      tr: new y({ x: 1, y: -1, angle: 90, createElement: Y("tr"), actionName: "scale" }),
      br: new y({ x: 1, y: 1, angle: 180, createElement: Y("br"), actionName: "scale" }),
      bl: new y({ x: -1, y: 1, angle: 270, createElement: Y("bl"), actionName: "scale" }),
      ml: new y({ visible: !1, x: -1, y: 0, angle: 90, createElement: E("ml"), actionName: "scale" }),
      mr: new y({ visible: !1, x: 1, y: 0, angle: 90, createElement: E("mr"), actionName: "scale" }),
      mt: new y({ visible: !1, x: 0, y: -1, angle: 0, createElement: E("mt"), actionName: "scale" }),
      mb: new y({ visible: !1, x: 0, y: 1, angle: 0, createElement: E("mb"), actionName: "scale" })
    }, this.addBordersAndControls();
  }
  createElement() {
    const e = f("div", { classList: ["ic-source-container"] }), t = f("div", { classList: ["ic-source-lower"] }), s = f("img", { classList: ["ic-source-image"] });
    t.appendChild(s);
    const r = f("div", { classList: ["ic-source-upper"] });
    return e.append(t, r), { container: e, lower: t, image: s, upper: r };
  }
  renderBefore(e) {
    const { croppedData: t, sourceData: s, angle: r } = e;
    this.elements.upper.setAttribute(x.ActionCursor, "move"), this.elements.upper.setAttribute(x.ActionName, "move");
    const o = t.scaleX, n = t.scaleY, c = {
      width: `${s.width}px`,
      height: `${s.height}px`,
      transform: new A().matrix([
        r.cos * t.scaleX,
        r.sin * t.scaleX,
        -r.sin * t.scaleY,
        r.cos * t.scaleY,
        s.left,
        s.top
      ]).value
    };
    w(this.elements.lower, c), w(this.elements.upper, c), w(this.elements.image, {
      transform: new A().scaleX(t.flipX ? -1 : 1).scaleY(t.flipY ? -1 : 1).value
    }), this.domScaleX = this.scale / o, this.domScaleY = this.scale / n;
  }
}
var B = /* @__PURE__ */ ((i) => (i.tl = "br", i.br = "tl", i.tr = "bl", i.bl = "tr", i.ml = "mr", i.mr = "ml", i.mt = "mb", i.mb = "mt", i))(B || {});
function pe(i) {
  const { pointer: e, croppedData: t, croppedControlCoords: s, sourceData: r, sourceControlCoords: o, corner: n } = i, c = t.angle, h = s[B[n]], d = e.subtract(h).rotate(-c), a = new l(o[n]).subtract(h).rotate(-c), p = Math.sign(d.x) === Math.sign(a.x) ? Math.abs(d.x) : 0, u = Math.sign(d.y) === Math.sign(a.y) ? Math.abs(d.y) : 0;
  let m = V(p, 16, Math.abs(a.x)), g = V(u, 16, Math.abs(a.y));
  const X = {
    tl: () => ({ x: -m, y: -g }),
    bl: () => ({ x: -m, y: 0 }),
    tr: () => ({ x: 0, y: -g }),
    br: () => ({ x: 0, y: 0 }),
    ml: () => ({ x: -m, y: -(g = t.height * t.scaleY) / 2 }),
    mr: () => ({ x: 0, y: -(g = t.height * t.scaleY) / 2 }),
    mt: () => ({ x: -(m = t.width * t.scaleX) / 2, y: -g }),
    mb: () => ({ x: -(m = t.width * t.scaleX) / 2, y: 0 })
  }, b = new l(X[n]()).rotate(c).add(h), v = b.subtract(o.tl).rotate(-c);
  return {
    croppedData: {
      ...t,
      left: b.x,
      top: b.y,
      width: m / t.scaleX,
      height: g / t.scaleY,
      cropX: v.x / t.scaleX,
      cropY: v.y / t.scaleY
    },
    sourceData: r
  };
}
const me = (i) => {
  const { pointer: e, croppedData: t, croppedControlCoords: s, sourceData: r } = i, o = t.width * t.scaleX, n = t.height * t.scaleY, c = r.width * t.scaleX, h = r.height * t.scaleY, d = o - c, a = n - h, p = e.subtract(s.tl).rotate(-t.angle), u = e.subtract(s.br).rotate(180 - t.angle), m = {
    tl: { x: 0, y: 0 },
    bl: { x: 0, y: a },
    br: { x: d, y: a },
    tr: { x: d, y: 0 },
    l: { x: 0, y: p.y },
    t: { x: p.x, y: 0 },
    r: { x: d, y: p.y },
    b: { x: p.x, y: a }
  }, g = p.y > 0 ? "t" : u.y > h ? "b" : "", X = p.x > 0 ? "l" : u.x > c ? "r" : "", b = m[g + X], v = b ? new l(b).rotate(t.angle).add(s.tl) : e, C = new l(s.tl).subtract(v).rotate(-t.angle);
  return {
    croppedData: { ...t, cropX: C.x / t.scaleX, cropY: C.y / t.scaleY },
    sourceData: { ...r, left: v.x, top: v.y }
  };
};
var te = /* @__PURE__ */ ((i) => (i[i.tl = 0] = "tl", i[i.tr = 0] = "tr", i[i.br = -90] = "br", i[i.bl = -90] = "bl", i[i.ml = 90] = "ml", i[i.mr = 90] = "mr", i[i.mt = 0] = "mt", i[i.mb = 0] = "mb", i))(te || {});
function ue(i) {
  const { pointer: e, sourceControlCoords: t, croppedData: s, sourceData: r, croppedControlCoords: o, corner: n } = i, c = s.angle, h = t[B[n]], d = r.width * s.scaleX, a = r.height * s.scaleY, p = new l(t[B[n]]).subtract(t[n]).rotate(-c), u = Math.asin(a * Math.sign(p.x) / p.distanceFrom()) / (Math.PI / 180) + te[n], m = p.rotate(-u), g = e.subtract(h).rotate(-c - u), X = new l(o[n]).subtract(h).rotate(-c), b = Math.max(Math.abs(g.x) / Math.abs(m.x), Math.abs(X.x) / d, Math.abs(X.y) / a), v = d * b, C = a * b, N = {
    tl: () => ({ x: -v, y: -C }),
    br: () => ({ x: 0, y: 0 }),
    tr: () => ({ x: 0, y: -C }),
    bl: () => ({ x: -v, y: 0 }),
    ml: () => ({ x: -v, y: -C / 2 }),
    mr: () => ({ x: 0, y: -C / 2 }),
    mt: () => ({ x: -v / 2, y: -C }),
    mb: () => ({ x: -v / 2, y: 0 })
  }[n](), $ = new l(N).rotate(c).add(h), H = $.subtract(o.tl).rotate(-c).flipX().flipY(), I = s.scaleX * b, F = s.scaleY * b;
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
    sourceData: { ...r, left: $.x, top: $.y }
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
    s && s.forEach((r) => r(...t));
  }
}
class se {
  constructor(e, t) {
    this.container = e, this.listener = new ge(), this.sourceRenderer = new de(), this.cropRenderer = new le(), this.activeCursorStyle = {}, this.prepared = !1, this.cropping = !1, this.src = "", this.domListener = {
      "cropper:mouseover": (s) => {
        var r;
        s.stopPropagation(), this.activeCursorStyle.over = ((r = s.target) == null ? void 0 : r.getAttribute(x.ActionCursor)) || "", w(this.container, { cursor: this.activeCursorStyle.down || this.activeCursorStyle.over });
      },
      "cropper:mousedown": (s) => {
        var o, n;
        s.stopPropagation(), this.activeCursorStyle.down = ((o = s.target) == null ? void 0 : o.getAttribute(x.ActionCursor)) || "", w(this.container, { cursor: this.activeCursorStyle.down });
        const r = (n = s.target) == null ? void 0 : n.getAttribute(x.ActionName);
        r && this.eventCenter[r] ? (this.eventCenter[r](s), this.setCoords()) : this.cancel();
      },
      "cropper:dblclick": (s) => this.confirm(),
      "document:mousemove": (s) => this.actionHandler(s),
      "document:mouseup": (s) => {
        this.event = { e: s }, this.croppedTransform && (this.croppedData = { ...this.croppedTransform }, delete this.croppedTransform), this.sourceTransform && (this.sourceData = { ...this.sourceTransform }, delete this.sourceTransform), this.activeCursorStyle.down = "", w(this.container, { cursor: this.activeCursorStyle.down || this.activeCursorStyle.over });
      }
    }, this.eventCenter = {
      move: (s) => {
        this.startPoint = this.getPointer(s), this.event = { e: s, action: L.Moving };
      },
      scale: (s) => {
        var r;
        this.event = {
          e: s,
          action: L.Scaling,
          corner: (r = s.target) == null ? void 0 : r.getAttribute(x.ActionCorner),
          target: this.sourceRenderer
        };
      },
      crop: (s) => {
        var r;
        this.event = {
          e: s,
          action: L.Cropping,
          corner: (r = s.target) == null ? void 0 : r.getAttribute(x.ActionCorner),
          target: this.sourceRenderer
        };
      },
      moving: () => {
      },
      scaling: () => {
      },
      cropping: () => {
      }
    }, this.containerOffsetX = 0, this.containerOffsetY = 0, this.borderWidth = T, this.borderColor = _, this.cancelable = !0, this.actionHandler = async (s) => {
      var b, v;
      const { action: r, corner: o } = this.event || {};
      if (!r || !this.prepared)
        return;
      const { croppedData: n, croppedControlCoords: c, sourceData: h, sourceControlCoords: d } = this, a = this.getPointer(s);
      let p, u;
      if (r === L.Moving) {
        const C = new l(
          h.left + (a.x - (((b = this.startPoint) == null ? void 0 : b.x) || a.x)),
          h.top + (a.y - (((v = this.startPoint) == null ? void 0 : v.y) || a.y))
        ), N = me({ pointer: C, croppedData: n, croppedControlCoords: c, sourceData: h });
        p = N.croppedData, u = N.sourceData;
      } else if (r === L.Cropping && o)
        p = pe({ pointer: a, croppedData: n, croppedControlCoords: c, sourceData: h, sourceControlCoords: d, corner: o }).croppedData;
      else if (r === L.Scaling && o) {
        const C = ue({ pointer: a, croppedData: n, croppedControlCoords: c, sourceData: h, sourceControlCoords: d, corner: o });
        p = C.croppedData, u = C.sourceData;
      }
      this.croppedTransform = p, this.sourceTransform = u;
      const m = {
        src: this.src,
        croppedData: p || n,
        sourceData: u || h,
        angle: this.angle,
        croppedBackup: this.croppedBackup,
        sourceBackup: this.sourceBackup
      };
      await Promise.all([this.cropRenderer.render(m), this.sourceRenderer.render(m)]);
      const g = D(S, p || n), X = D(U, u || h);
      g.flipX && (g.cropX = X.width - g.width - g.cropX), g.flipY && (g.cropY = X.height - g.height - g.cropY), this.listener.fire("cropping", g, X);
    }, Object.assign(this, t), this.cropRenderer.borderWidth = this.sourceRenderer.borderWidth = this.borderWidth || T, this.cropRenderer.borderColor = this.sourceRenderer.borderColor = this.borderColor || _, this._element = this.createElement(), this._element.append(this.sourceRenderer.element, this.cropRenderer.element), e.appendChild(this._element), this.bindEvents();
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
  set scale(e) {
    if (this.cropRenderer.scale = this.sourceRenderer.scale = e, this.cropping) {
      const t = {
        src: this.src,
        angle: this.angle,
        croppedData: this.croppedData,
        croppedBackup: this.croppedBackup,
        sourceData: this.sourceData,
        sourceBackup: this.sourceBackup
      };
      this.cropRenderer.render(t), this.sourceRenderer.render(t);
    }
  }
  bindEvents() {
    this._element.addEventListener("mouseover", this.domListener["cropper:mouseover"]), this._element.addEventListener("mousedown", this.domListener["cropper:mousedown"]), this._element.addEventListener("dblclick", this.domListener["cropper:dblclick"]), document.addEventListener("mousemove", this.domListener["document:mousemove"]), document.addEventListener("mouseup", this.domListener["document:mouseup"]);
  }
  unbindEvents() {
    this._element.removeEventListener("mouseover", this.domListener["cropper:mouseover"]), this._element.removeEventListener("mousedown", this.domListener["cropper:mousedown"]), this._element.removeEventListener("dblclick", this.domListener["cropper:dblclick"]), document.removeEventListener("mousemove", this.domListener["document:mousemove"]), document.removeEventListener("mouseup", this.domListener["document:mouseup"]);
  }
  remove() {
    this.unbindEvents(), this.element.remove();
  }
  getPointer(e) {
    const t = this._element.getBoundingClientRect(), s = window.getComputedStyle(this._element), r = t.width ? G(s.width) / t.width : 1, o = t.height ? G(s.height) / t.height : 1;
    return new l((e.clientX - t.left) * r, (e.clientY - t.top) * o);
  }
  createElement() {
    const { borderLeftWidth: e, borderTopWidth: t, border: s, width: r, height: o, position: n } = window.getComputedStyle(this.container);
    return f("div", {
      classList: ["ic-container"],
      style: {
        display: this.cancelable ? "none" : "block",
        position: n !== "static" ? "absolute" : "relative",
        left: `${this.containerOffsetX}px`,
        top: `${this.containerOffsetY}px`,
        width: r,
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
    this.src = e, this.croppedBackup = D(S, t), this.sourceBackup = D(k, s), this.croppedData = D(S, t), this.sourceData = D(U, s), this.angle = new ne(this.croppedData.angle);
    const { cropX: r, cropY: o, scaleX: n, scaleY: c, angle: h, flipX: d, flipY: a, left: p, top: u } = this.croppedData;
    this.croppedData.cropX = d ? this.sourceData.width - this.croppedData.width - r : r, this.croppedData.cropY = a ? this.sourceData.height - this.croppedData.height - o : o;
    const m = new l(-this.croppedData.cropX * n, -this.croppedData.cropY * c).rotate(h).add({ x: p, y: u });
    this.sourceData.left = m.x, this.sourceData.top = m.y;
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
    let { cropX: s, cropY: r, scaleX: o, scaleY: n, angle: c, flipX: h, flipY: d, left: a, top: p } = e;
    s = h ? t.width - e.width - s : s, r = d ? t.height - e.height - r : r;
    const { x: u, y: m } = new l(-s * o, -r * n).rotate(c).add({ x: a, y: p });
    return { angle: c, left: u, top: m, width: t.width, height: t.height, scaleX: o, scaleY: n, flipX: h, flipY: d };
  }
  /**
   * Start cropping
   */
  async crop(e) {
    this.prepared = !1, this.cropping = !0, this.setData((e == null ? void 0 : e.src) || this.src, (e == null ? void 0 : e.cropData) || this.croppedData, (e == null ? void 0 : e.sourceData) || this.sourceData), await this.setCoords(), this.setCropperVisibility(!0), this.listener.fire("start"), this.prepared = !0;
  }
  /**
   * Confirm cropping
   */
  confirm() {
    const e = this.croppedData, t = this.sourceData;
    e.flipX && (e.cropX = t.width - e.width - e.cropX), e.flipY && (e.cropY = t.height - e.height - e.cropY), this.listener.fire("confirm", D(S, e), D(k, t)), this.listener.fire("end", D(S, e), D(k, t)), this.setCropperVisibility(!1), this.cropping = !1;
  }
  /**
   * Cancel cropping
   */
  cancel() {
    this.listener.fire("cancel", D(S, this.croppedBackup), D(k, this.sourceBackup)), this.listener.fire("end", D(S, this.croppedBackup), D(k, this.sourceBackup)), this.setCropperVisibility(!1), this.cropping = !1;
  }
}
function fe(i) {
  return i.type === "image";
}
class be {
  constructor(e, t) {
    this.crop = () => {
      var o;
      const s = (o = this.canvas) == null ? void 0 : o.getActiveObject();
      if (!s || !this.cropper || !fe(s))
        return;
      this.cropTarget = s;
      const r = s.toObject();
      this.cropper.crop({ src: s.getSrc(), cropData: r, sourceData: s._cropSource || r });
    }, this.canvas = e, this.init(t);
  }
  get on() {
    return this.cropper.on.bind(this.cropper);
  }
  get off() {
    return this.cropper.off.bind(this.cropper);
  }
  init(e) {
    var t;
    this.canvas && (this.cropper = new se(this.canvas.wrapperEl, e), (t = this.canvas) == null || t.on("mouse:dblclick", this.crop), this.cropper.on("cropping", (s, r) => {
      var o;
      this.cropTarget && (this.cropTarget.set({ ...s, cropX: s.cropX, cropY: s.cropY }), this.cropTarget._cropSource = r, (o = this.canvas) == null || o.renderAll());
    }), this.cropper.on("cancel", (s) => {
      var r, o;
      (r = this.cropTarget) == null || r.set({ ...s, cropX: s.cropX, cropY: s.cropY }), (o = this.canvas) == null || o.renderAll();
    }), this.cropper.on("start", () => {
      var s, r;
      (s = this.canvas) == null || s.discardActiveObject(), (r = this.canvas) == null || r.renderAll();
    }), this.cropper.on("end", () => {
      var s, r;
      this.cropTarget && ((s = this.canvas) == null || s.setActiveObject(this.cropTarget)), (r = this.canvas) == null || r.renderAll();
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
