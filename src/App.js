import React, { useState, useEffect, useCallback } from "react";
import {
  Button,
  Box,
  FormControl,
  Radio,
  RadioGroup,
  FormControlLabel,
} from "@material-ui/core";

import "@tensorflow/tfjs";
import * as bodyPix from "@tensorflow-models/body-pix";

import WebCam from "react-webcam";

const App = () => {
  const [model, setModel] = useState();
  const [timerId, setTimerId] = useState();
  const [maskMode, setMaskMode] = useState("person");
  const [mask, setMask] = useState();

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

  useEffect(() => {
    const webcam = document.getElementById("webcam");
    const canvas = document.getElementById("canvas");
    const opacity = 0.7;

    bodyPix.drawMask(canvas, webcam, mask, opacity, 0, false);
  }, [mask]);

  const showResult = useCallback(
    (seg) => {
      let foregroundColor;
      let backgroundColor;

      if (maskMode === "background") {
        foregroundColor = { r: 0, g: 0, b: 0, a: 0 };
        backgroundColor = { r: 127, g: 127, b: 127, a: 255 };
      } else if (maskMode === "person") {
        foregroundColor = { r: 255, g: 255, b: 255, a: 255 };
        backgroundColor = { r: 0, g: 0, b: 0, a: 255 };
      } else {
        foregroundColor = { r: 0, g: 0, b: 255, a: 0 };
        backgroundColor = { r: 0, g: 0, b: 255, a: 0 };
      }
      setMask(bodyPix.toMask(seg, foregroundColor, backgroundColor, true));
    },
    [maskMode]
  );

  const estimate = useCallback(() => {
    const webcam = document.getElementById("webcam");
    if (!!model) {
      model.segmentPerson(webcam).then((segmentation) => {
        showResult(segmentation);
      });
    }
  }, [model, showResult]);

  const start = useCallback(() => {
    if (!!timerId) {
      clearTimeout(timerId);
    }
    setTimerId(
      setInterval(() => {
        estimate();
      }, 100)
    );
  }, [estimate, timerId]);

  const stop = useCallback(() => {
    clearInterval(timerId);
    setTimerId(null);
  }, [timerId]);

  return (
    <>
      <Box>
        <Button onClick={start}>推定</Button>
        <Button onClick={stop}>停止</Button>
      </Box>
      <Box>
        <FormControl>
          <RadioGroup row value={maskMode} onChange={(e) => setMaskMode(e.target.value)}>
            <FormControlLabel
              value="background"
              control={<Radio />}
              label="Mask background"
            />
            <FormControlLabel
              value="person"
              control={<Radio />}
              label="Mask person"
            />
            <FormControlLabel value="no" control={<Radio />} label="No mask" />
          </RadioGroup>
        </FormControl>
      </Box>
      <Box>
        <WebCam id="webcam" width={640} height={480} />
        <canvas id="canvas" width={640} height={480} />
      </Box>
    </>
  );
};

export default App;
