import { logData } from '../utils/mongodb'; 
import {
  FrameButton,
  FrameContainer,
  FrameImage,
  FrameInput,
  FrameReducer,
  NextServerPageProps,
  getPreviousFrame,
  useFramesReducer,
  getFrameMessage,
} from "frames.js/next/server";
import Link from "next/link";
import { DEBUG_HUB_OPTIONS } from "./debug/constants";
import { getTokenUrl } from "frames.js";

type State = {
  active: string;
  total_button_presses: number;
};

const initialState = { active: "1", total_button_presses: 0 };

const reducer: FrameReducer<State> = (state, action) => {
  return {
    total_button_presses: state.total_button_presses + 1,
    active: action.postBody?.untrustedData.buttonIndex
      ? String(action.postBody?.untrustedData.buttonIndex)
      : "1",
  };
};

// This is a react server component only
export default async function Home({
  params,
  searchParams,
}: NextServerPageProps) {
  const previousFrame = getPreviousFrame<State>(searchParams);

  const frameMessage = await getFrameMessage(previousFrame.postBody, {
    ...DEBUG_HUB_OPTIONS,
  });

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
      // Add any additional fields you want to log
    };

    logData("frameMessages", logObject)
    .then(() => console.log("Data logged to MongoDB"))
    .catch((err) => console.error("Failed to log data to MongoDB", err));
}


  const [state, dispatch] = useFramesReducer<State>(
    reducer,
    initialState,
    previousFrame
  );

  // Here: do a server side side effect either sync or async (using await), such as minting an NFT if you want.
  // example: load the users credentials & check they have an NFT

  console.log("info: state is:", state);

  if (frameMessage) {
    const {
      isValid,
      buttonIndex,
      inputText,
      castId,
      requesterFid,
      casterFollowsRequester,
      requesterFollowsCaster,
      likedCast,
      recastedCast,
      requesterVerifiedAddresses,
      requesterUserData,
    } = frameMessage;

    console.log("info: frameMessage is:", frameMessage);
  }

  const baseUrl = process.env.NEXT_PUBLIC_HOST || "http://localhost:3000";

  // then, when done, return next frame
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
        {/* FrameImage to provide visual context or branding */}
        <FrameImage>
          <div style={{ width: '100%', height: '100%', backgroundColor: 'slategray', color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            {frameMessage?.inputText ? frameMessage.inputText : "Super Bowl winner. Like/RC/Follow to boost entry. Unlimited entries"}
          </div>
        </FrameImage>
  
        {/* FrameButton for "49ers" */}
        <FrameButton onClick={() => dispatch({ type: 'action', postBody: { untrustedData: { team: "49ers" } } })}>
          49ers
        </FrameButton>
  
        {/* FrameButton for "Chiefs" */}
        <FrameButton onClick={() => dispatch({ type: 'action', postBody: { untrustedData: { team: "Chiefs" } } })}>
          Chiefs
        </FrameButton>
      </FrameContainer>
    </div>
  );
}
