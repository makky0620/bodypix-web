import React, { useState, useEffect, useRef, useCallback } from "react";
import { Button, Box } from "@material-ui/core";

import "@tensorflow/tfjs";
import * as bodyPix from "@tensorflow-models/body-pix";

import WebCam from "react-webcam";

const App = () => {
  const webcamRef = useRef(null);

  const [model, setModel] = useState();
  const [img, setImg] = useState();
  // const [seg, setSeg] = useState();

  useEffect(() => {
    const params = {
      architecture: "MobileNetV1",
      outputStride: 16,
      multiplier: 0.75,
      quantBytes: 2,
    };

    bodyPix.load(params).then((net) => {
      setModel(net);
    });
  }, []);

  const capture = useCallback(() => {
    setImg(webcamRef.current.getScreenshot());
  }, [webcamRef]);

  const estimateByVideo = useCallback(() => {
    const webcam = document.getElementById("webcam");
    if (!!model) {
      model.segmentPerson(webcam).then((segmentation) => {
        showResult(segmentation);
      });
    }
  }, [model]);

  const showResult = useCallback((seg) => {
    const foregroundColor = { r: 255, g: 255, b: 255, a: 255 };
    const backgroundColor = { r: 10, g: 10, b: 10, a: 255 };
    const mask = bodyPix.toMask(seg, foregroundColor, backgroundColor, true);

    const webcam = document.getElementById("webcam");
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");
    console.log(webcam);
    console.log(canvas);
    const opacity = 0.7;

    bodyPix.drawMask(canvas, webcam, mask, opacity, 0, false);
  }, []);

  return (
    <>
      <Box>
        <WebCam
          id="webcam"
          ref={webcamRef}
          width={400}
          height={300}
        />
        <canvas id="canvas"/>
      </Box>
      <Box>
        <Button onClick={capture}>撮影</Button>
        <Button onClick={estimateByVideo}>推定</Button>
      </Box>
    </>
  );
};

export default App;
