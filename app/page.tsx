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

  const baseUrl = process.env.NEXT_PUBLIC_HOST || "http://localhost:3000";

  // Function to handle button click
  const handleButtonClick = (teamName: string) => {
    dispatch({ type: 'action', postBody: { untrustedData: { team: teamName } } });
  };

  return (
    <div className="p-4">
      frames.js starter kit. The Template Frame is on this page, it's in
      the html meta tags (inspect source). <Link href={`/debug?url=${baseUrl}`} className="underline">
        Debug
      </Link>
      <FrameContainer
        postUrl="/frames"
        state={state}
        previousFrame={previousFrame}
      >
        <FrameImage src="https://picsum.photos/seed/frames.js/1146/600" />
        <FrameButton action="post" onClick={() => handleButtonClick("49ers")}>
          49ers
        </FrameButton>
        <FrameButton action="post" onClick={() => handleButtonClick("Chiefs")}>
          Chiefs
        </FrameButton>
      </FrameContainer>
    </div>
  );
}
