import React, { useRef } from "react";
import SockJS from "sockjs-client";

const sock = new SockJS("http://localhost:8000/move-ball");
export default function AddBall() {
  let countBall = useRef(0);
  let ball, xPosition, yPosition, previousXPosition, previousYPosition;

  document.onmousemove = move;
  document.onmouseup = drop;
  const incrementOneCountBall = () => {
    countBall.current = countBall.current + 1;
  };

  sock.onopen = function () {};
  sock.onmessage = function (e) {
    handlerNewMessage(JSON.parse(e.data));
  };
  sock.onclose = function () {};

  const handlerNewMessage = (message) => {
    let messageBody = message;
    switch (messageBody.type) {
      case "add-ball":
        incrementOneCountBall();
        addBallToGround({
          xPosition: messageBody.xPosition,
          yPosition: messageBody.yPosition,
        });
        break;

      case "move-ball":
        const ball = messageBody.data;
        messageMove(
          ball.ballTahHtmlID,
          ball.xPosition,
          ball.yPosition,
          ball.previousXPosition,
          ball.previousYPosition
        );
        break;
    }
  };

  const getPositionNewBall = () => {
    const groundContainerElement = document.querySelector("#ground-container");
    const groundContainerElementBoundingClientRect =
      groundContainerElement.getBoundingClientRect();
    const xPosition =
      getRandomNumber(
        groundContainerElementBoundingClientRect.x,
        groundContainerElementBoundingClientRect.width
      ) - 30;
    const yPosition =
      getRandomNumber(
        groundContainerElementBoundingClientRect.y,
        groundContainerElementBoundingClientRect.height
      ) - 30;
    return {
      xPosition,
      yPosition,
    };
  };

  const addBallToGround = (positions) => {
    generateBall(positions.xPosition, positions.yPosition);
  };

  const getRandomNumber = (min, max) => {
    return Math.random() * (max - min) + min;
  };

  const generateBall = (xPosition, yPosition) => {
    const ball = document.createElement("div");
    ball.classList.add("ball");
    ball.setAttribute("id", "ball-" + countBall.current);
    ball.style.left = xPosition + "px";
    ball.style.top = yPosition + "px";
    ball.innerHTML = countBall.current;
    ball.onmousedown = drag;
    document.querySelector("#ground-container").appendChild(ball);
  };

  function drag(e) {
    ball = e.target;
    previousXPosition = xPosition - ball.offsetLeft;
    previousYPosition = yPosition - ball.offsetTop;
  }

  function messageMove(
    ballTahHtmlID,
    xPosition,
    yPosition,
    previousXPosition,
    previousYPosition
  ) {
    const ball = document.querySelector(`#${ballTahHtmlID}`);
    if (!ball){
      return
    }
    ball.style.left = xPosition - previousXPosition + "px";
    ball.style.top = yPosition - previousYPosition + "px";
  }

  function move(e) {
    if (e.pageX) {
      xPosition = e.pageX;
      yPosition = e.pageY;
    }

    if (ball) {
      ball.style.left = xPosition - previousXPosition + "px";
      ball.style.top = yPosition - previousYPosition + "px";
      sock.send(
        JSON.stringify({
          type: "move-ball",
          data: {
            ballTahHtmlID: ball.id,
            xPosition: xPosition,
            yPosition: yPosition,
            previousXPosition: previousXPosition,
            previousYPosition: previousYPosition,
          },
        })
      );
    }
  }

  function drop() {
    ball = false;
  }

  return (
    <div id="add-ball-container">
      <button
        onClick={() => {
          const positions = getPositionNewBall();
          incrementOneCountBall();
          addBallToGround({
            xPosition: positions.xPosition,
            yPosition: positions.yPosition,
          });
          sock.send(
            JSON.stringify({
              type: "add-ball",
              xPosition: positions.xPosition,
              yPosition: positions.yPosition,
            })
          );
        }}
      >
        Add ball to ground
      </button>
    </div>
  );
}
