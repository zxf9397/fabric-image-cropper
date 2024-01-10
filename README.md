# Image Cropper

Provide image cropping interaction events for fabric.js

## Demo

https://codepen.io/mubens/pen/mdoEYwm?editors=0010

## Installing

```js
  npm install icropper
```

## Using

```ts
import { FabricCropListener } from 'icropper';
import { fabric } from 'fabric';

import 'icropper/style';

const fabricCanvas = new fabric.Canvas(document.querySelector('canvas'));

const listener = new FabricCropListener(fabricCanvas);

listener.on('start', () => {});

listener.on('cropping', (crop, source) => {});

listener.on('cancel', (crop, source) => {});

listener.on('confirm', (crop, source) => {});

listener.on('end', (crop, source) => {});
```
