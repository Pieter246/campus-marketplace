import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { getItemById } from "@/data/items";
import Image from "next/image";
import numeral from "numeral";
import BackButton from "./back-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import imageUrlFormatter from "@/lib/imageUrlFormatter";
import ItemConditionBadge from "@/components/item-condition-badge";
import ReactMarkdown from "react-markdown";
import { cookies } from "next/headers";
import { DecodedIdToken } from "firebase-admin/auth";
import { auth } from "@/firebase/server";
import BuyButton from "./buy-button";
import ApproveForm from "./approve-form";
import SellButton from "./sell-button";
import WithdrawButton from "./withdraw-button";
import Script from "next/script";

export const dynamic = "force-dynamic"; // caching for Vercel

export default async function Item({ params }: { params: Promise<any> }) {
  // 1) auth stuff (unchanged)
  const cookieStore = await cookies();
  const token = cookieStore.get("firebaseAuthToken")?.value;
  let verifiedToken: DecodedIdToken | null = null;
  if (token) {
    verifiedToken = await auth.verifyIdToken(token);
  }

  // 2) get item (unchanged)
  const paramsValue = await params;
  const item = await getItemById(paramsValue.itemId);

  // 3) use at most 3 images
  const images = (item.images ?? []).slice(0, 3);

  // 4) address lines (unchanged)
  const addressLines = [item.collectionAddress].filter(Boolean);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/*
        - It looks for the gallery root by id: "item-gallery-root".
        - If found and not initialized :
             shows image 0,
             sets up a timer to move to the next image every 2 seconds if > 1 images),
             makes small images clickable to show as the big image.

        - Next.js client navigation might not reload the page,
          we run a poll every second to see if the gallery exists and needs setup.
          
      */}
      <Script id="gallery-logic" strategy="afterInteractive">
        {`
(function () {
  // This flag prevents the setting up multiple polls
  if (window.__GalleryPollStarted) return;
  window.__GalleryPollStarted = true;

  function setupGallery(root) {
    if (!root || root.dataset.initialized === "true") return;

    // grab big image wrappers and small buttons
    var bigs = Array.prototype.slice.call(root.querySelectorAll("[data-big-index]"));
    var thumbs = Array.prototype.slice.call(root.querySelectorAll("[data-thumb-index]"));
    var count = bigs.length;

    if (count === 0) return;

    var active = 0;
    var timerId = null;

    function show(idx) {
      // keep idx in range
      active = ((idx % count) + count) % count;

      // show only the active big image
      for (var i = 0; i < bigs.length; i++) {
        if (i === active) {
          bigs[i].classList.remove("hidden", "opacity-0");
          bigs[i].classList.add("opacity-100");
        } else {
          bigs[i].classList.add("hidden");
          bigs[i].classList.remove("opacity-100");
        }
      }

      // highlight active thumbnail with a ring around it
      for (var j = 0; j < thumbs.length; j++) {
        if (j === active) {
          thumbs[j].classList.add("ring-2", "ring-primary");
        } else {
          thumbs[j].classList.remove("ring-2", "ring-primary");
        }
      }
    }

    // start with first image
    show(0);

    // clicking a small image shows that one
    thumbs.forEach(function (btn, i) {
      btn.addEventListener("click", function () {
        show(i);
      });
    });

    // if more than one image, automatically move to the next image every 2 seconds
    if (count > 1) {
      timerId = setInterval(function () {
        show(active + 1);
      }, 2000);
    }

    // mark as initialized and remember how to stop the timer if all the objects get removed
    root.dataset.initialized = "true";
    root.__Cleanup = function () {
      if (timerId) clearInterval(timerId);
    };
  }

  // poll: every second, try to set up the gallery if it exists and isn't set up yet
  // SPA navigations
  window.__GalleryPoll = setInterval(function () {
    var root = document.getElementById("item-gallery-root");
    if (root && root.dataset.initialized !== "true") {
      setupGallery(root);
    }
  }, 1000);

  // Clean up if page is unloading
  window.addEventListener("beforeunload", function () {
    if (window.__GalleryPoll) clearInterval(window.__GalleryPoll);
    var root = document.getElementById("item-gallery-root");
    if (root && root.__Cleanup) root.__Cleanup();
  });
})();
        `}
      </Script>

      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-3xl font-bold">{item.title}</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* IMAGES */}
          {!!images.length && (
            <div id="item-gallery-root" className="space-y-4">
              {/* Big image area */}
              <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden">
                {images.length === 1 ? (
                  <Image
                    fill
                    className="object-cover"
                    src={imageUrlFormatter(images[0])}
                    alt="Item image"
                    sizes="(max-width: 768px) 100vw, 800px"
                    priority
                  />
                ) : (
                  images.map((img, idx) => (
                    <div
                      key={img}
                      data-big-index={idx}
                      className={idx === 0 ? "absolute inset-0 opacity-100" : "absolute inset-0 hidden opacity-0"}
                    >
                      <Image
                        fill
                        className="object-cover transition-opacity duration-300"
                        src={imageUrlFormatter(img)}
                        alt={`Item image ${idx + 1}`}
                        sizes="(max-width: 768px) 100vw, 800px"
                        priority={idx === 0}
                      />
                    </div>
                  ))
                )}
              </div>

              {/* Small images under the big one with no arrows. Shows only if > 1 image */}
              {images.length > 1 && (
                <Carousel opts={{ align: "start" }} className="w-full px-2">
                  <CarouselContent className="justify-center gap-4">
                    {images.map((img, index) => (
                      <CarouselItem key={img} className="sm:basis-1/3 md:basis-1/4">
                        <button
                          type="button"
                          data-thumb-index={index}
                          className="block w-full"
                          aria-label={`Show image ${index + 1}`}
                        >
                          <Card className="relative aspect-[4/3] overflow-hidden rounded-xl">
                            <Image
                              fill
                              className="object-cover"
                              src={imageUrlFormatter(img)}
                              alt={`Thumbnail ${index + 1}`}
                            />
                          </Card>
                        </button>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                </Carousel>
              )}
            </div>
          )}

          {/* PRICE + CONDITION */}
          <div className="flex items-center gap-6">
            <h2 className="text-3xl font-light">R{numeral(item.price).format("0,0")}</h2>
            <ItemConditionBadge condition={item.condition} className="text-base" />
          </div>

          {/* ADDRESS */}
          <div className="space-y-1">
            <h3 className="text-lg font-medium">Location</h3>
            <p className="text-lg font-light">
              {addressLines.map((line, idx) => (
                <span key={idx}>
                  {line}
                  {idx < addressLines.length - 1 && ", "}
                </span>
              ))}
            </p>
          </div>

          {/* DESCRIPTION */}
          <div className="max-w-screen-md leading-relaxed">
            <ReactMarkdown>{item.description}</ReactMarkdown>
          </div>

          <div className="pt-5 mt-2 border-t" />

          {/* ACTIONS / APPROVALS */}
          {item.status !== "sold" ? (
            <>
              {!(verifiedToken?.admin && item.status === "pending") && (
                <div className="grid grid-cols-2 gap-4">
                  {(!verifiedToken || (!verifiedToken.admin && verifiedToken.uid !== item.sellerId)) && (
                    <BuyButton id={item.id} />
                  )}
                  {verifiedToken?.uid === item.sellerId && item.status === "draft" && <SellButton id={item.id} />}
                  {((verifiedToken?.admin && item.status === "for-sale") ||
                    (verifiedToken?.uid === item.sellerId && ["pending", "for-sale"].includes(item.status))) && (
                    <WithdrawButton id={item.id} />
                  )}
                  <BackButton />
                </div>
              )}
              {verifiedToken?.admin && item.status === "pending" && (
                <ApproveForm id={item.id} condition={item.condition} />
              )}
            </>
          ) : (
            <BackButton />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
