import { expect, describe, it, vi } from "vitest";
import { render, screen, waitForElementToBeRemoved } from "@testing-library/react";
import HomePage from "./HomePage";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { SnackbarProvider } from "../hooks/useSnackbar";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { StateProvider } from "../context/StateProvider";
import { PostData, RecommendedData } from "../interfaces";

const mockPostData: { posts: PostData[]; totalPageCount: number } = {
  posts: [
    {
      isUserLiked: false,
      createdAt: new Date(),
      _id: "0",
      title: "title 1",
      content: "some long text",
      commentCount: 1,
      likedCount: 1,
      thumbnailId: undefined,
      tags: ["tag1", "tag2", "tag3"],
      user: {
        profilePictureId: "1",
        firstname: "someone",
        lastname: "someone",
        username: "somesome37",
        description: "someone who does stuff",
      },
    },
  ],

  totalPageCount: 1,
};

const mockRecommendedData: RecommendedData = {
  tags: [
    {
      name: "tag1",
    },
    {
      name: "tag2",
    },
    {
      name: "tag3",
    },
  ],
  users: [
    {
      profilePictureId: "1",
      firstname: "someone",
      lastname: "someone",
      username: "somesome37",
      description: "someone who does stuff",
    },

    {
      profilePictureId: "2",
      firstname: "someotherone",
      lastname: "someotherone",
      username: "somesome38",
      description: "some person who does stuff",
    },
    {
      profilePictureId: "3",
      firstname: "anyone",
      lastname: "anyone",
      username: "onion33",
      description: "the one who does stuff",
    },
  ],
};

const mockFetch = vi.fn((url) => {
  if (url.includes("/posts")) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockPostData),
    });
  } else if (url.includes("/recommended")) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockRecommendedData),
    });
  } else if (url.includes("/notification") && !url.includes("see") && !url.includes("see")) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve([]),
    });
  } else {
    return Promise.reject(new Error("404 Not Found"));
  }
});

global.fetch = mockFetch as any;

describe("Home page render tests", () => {
  it("should render the buttons", async () => {
    process.on("warning", (warning) => {
      console.log(warning.stack);
    });

    render(
      <StateProvider>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <SnackbarProvider>
            <HomePage />
          </SnackbarProvider>
        </LocalizationProvider>
      </StateProvider>
    );

    const loadingIndicator = screen.getByText(/Loading/);
    await waitForElementToBeRemoved(loadingIndicator);

    const AllPostsTabButton = screen.getByRole("button", { name: "All" });
    const recommendedUser1 = screen.getAllByText(mockRecommendedData.users[0].description as string)[0];
    const recommendedUser2 = screen.getAllByText(mockRecommendedData.users[1].description as string)[0];
    const recommendedUser3 = screen.getAllByText(mockRecommendedData.users[2].description as string)[0];

    //@ts-expect-error vitest seems to be okay with the method
    expect(AllPostsTabButton).toBeInTheDocument();
    //@ts-expect-error vitest seems to be okay with the method
    expect(recommendedUser1).toBeInTheDocument();
    //@ts-expect-error vitest seems to be okay with the method
    expect(recommendedUser2).toBeInTheDocument();
    //@ts-expect-error vitest seems to be okay with the method
    expect(recommendedUser3).toBeInTheDocument();
  });
});
