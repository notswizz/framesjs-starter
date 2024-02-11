import { logData } from '../utils/mongodb';
import {
  FrameButton,
  FrameContainer,
  FrameImage,
  FrameReducer,
  NextServerPageProps,
  getPreviousFrame,
  useFramesReducer,
  getFrameMessage,
} from "frames.js/next/server";
import Link from "next/link";
import { DEBUG_HUB_OPTIONS } from "./debug/constants";

type State = {
  active: string;
  total_button_presses: number;
};

const initialState: State = { active: "1", total_button_presses: 0 };

const reducer: FrameReducer<State> = (state, action) => {
  return {
    total_button_presses: state.total_button_presses + 1,
    active: action.postBody?.untrustedData.buttonIndex
      ? String(action.postBody?.untrustedData.buttonIndex)
      : state.active,
  };
};

export default function Home({ searchParams }: NextServerPageProps) {
  const previousFrame = getPreviousFrame<State>(searchParams);
  const [state, dispatch] = useFramesReducer<State>(
    reducer,
    initialState,
    previousFrame
  );

  const frameMessagePromise = getFrameMessage(previousFrame.postBody, {
    ...DEBUG_HUB_OPTIONS,
  });

  frameMessagePromise.then((frameMessage) => {
    if (frameMessage) {
      const logObject = {
        buttonIndex: frameMessage.buttonIndex,
        castId: frameMessage.castId,
        inputText: frameMessage.inputText,
        requesterFid: frameMessage.requesterFid,
        isValid: frameMessage.isValid,
        casterFollowsRequester: frameMessage.casterFollowsRequester,
        requesterFollowsCaster: frameMessage.requesterFollowsCaster,
        likedCast: frameMessage.likedCast,
        recastedCast: frameMessage.recastedCast,
        requesterVerifiedAddresses: frameMessage.requesterVerifiedAddresses,
        requesterUserData: frameMessage.requesterUserData,
      };

      logData("frameMessages", logObject)
      .then(() => console.log("Data logged to MongoDB"))
      .catch((err) => console.error("Failed to log data to MongoDB", err));
    }
  });

  const baseUrl = "http://framesjs-starter-lemon.vercel.app";

  // Simplified without onClick since it's not a valid prop for FrameButton
  return (
    <div className="p-4">
      <h2>Follow notswizz</h2>
      <Link href={`/debug?url=${baseUrl}`} className="underline">Debug</Link>
      <FrameContainer postUrl="/frames" state={state} pathname="/" previousFrame={previousFrame}>
        <FrameImage src="https://a.espncdn.com/combiner/i?img=%2Fphoto%2F2024%2F0209%2Fr1288854_1296x729_16%2D9.jpg&w=920&h=518&scale=crop&cquality=80&location=origin&format=jpg" />
        <FrameButton action="post">
          49ers
        </FrameButton>
        <FrameButton action="post">
          Chiefs
        </FrameButton>
      </FrameContainer>
    </div>
  );
}
