import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { getItemById } from "@/data/items";
import Image from "next/image";
import numeral from "numeral";
import BackButton from "./back-button";
import { Card, CardContent } from "@/components/ui/card";
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
import PublishButton from "./publish-button";
import Script from "next/script";

export const dynamic = "force-dynamic";

export default async function Item({ params }: { params: Promise<any> }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("firebaseAuthToken")?.value;
  let verifiedToken: DecodedIdToken | null = null;
  if (token) {
    verifiedToken = await auth.verifyIdToken(token);
  }

  const paramsValue = await params;
  const item = await getItemById(paramsValue.itemId);

  const images = (item.images ?? []).slice(0, 3);
  const addressLines = [item.collectionAddress].filter(Boolean);

  return (
    <div className="max-w-5xl mx-auto p-4">
      {/* Gallery Script */}
      <Script id="gallery-logic" strategy="afterInteractive">
        {`
(function () {
  if (window.__GalleryPollStarted) return;
  window.__GalleryPollStarted = true;

  function setupGallery(root) {
    if (!root || root.dataset.initialized === "true") return;
    var bigs = Array.from(root.querySelectorAll("[data-big-index]"));
    var thumbs = Array.from(root.querySelectorAll("[data-thumb-index]"));
    var count = bigs.length;
    if (count === 0) return;
    var active = 0;
    var timerId = null;

    function show(idx) {
      active = ((idx % count) + count) % count;
      bigs.forEach((b, i) => {
        b.classList.toggle("hidden", i !== active);
        b.classList.toggle("opacity-100", i === active);
        b.classList.toggle("opacity-0", i !== active);
      });
      thumbs.forEach((t, i) => {
        t.classList.toggle("ring-2", i === active);
        t.classList.toggle("ring-primary", i === active);
        t.classList.toggle("ring-offset-2", i === active);
        t.classList.toggle("rounded-lg", i === active);
        t.classList.toggle("ring-offset-background", i === active);
      });
    }

    show(0);
    thumbs.forEach((btn, i) => btn.addEventListener("click", () => show(i)));
    if (count > 1) timerId = setInterval(() => show(active + 1), 5000);
    root.dataset.initialized = "true";
    root.__Cleanup = () => timerId && clearInterval(timerId);
  }

  window.__GalleryPoll = setInterval(() => {
    var root = document.getElementById("item-gallery-root");
    if (root && root.dataset.initialized !== "true") setupGallery(root);
  }, 1000);

  window.addEventListener("beforeunload", () => {
    if (window.__GalleryPoll) clearInterval(window.__GalleryPoll);
    var root = document.getElementById("item-gallery-root");
    root?.__Cleanup && root.__Cleanup();
  });
})();
        `}
      </Script>

      <Card className="shadow-sm">
        <CardContent className="space-y-6">
          {/* Two-column responsive layout */}
          <div className="flex flex-col md:flex-row md:gap-6">
            {/* IMAGES */}
            {!!images.length && (
              <div id="item-gallery-root" className="w-full md:w-1/2 space-y-4">
                {/* Big image */}
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

                {/* Thumbnails - scrollable on mobile */}
                {images.length > 1 && (
                  <Carousel opts={{ align: "start" }} className="w-full px-2 overflow-x-auto">
                    <CarouselContent className="flex gap-4">
                      {images.map((img, index) => (
                        <CarouselItem key={img} className="flex-none sm:basis-1/3 md:basis-1/4">
                          <button
                            type="button"
                            data-thumb-index={index}
                            className="block w-full m-1"
                            aria-label={`Show image ${index + 1}`}
                          >
                            <Card className="cursor-pointer relative aspect-[4/3] overflow-hidden rounded-lg">
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

            {/* CONTENT */}
            <div className="w-full md:w-1/2 flex flex-col justify-between">
              <div className="space-y-4">
                <h1 className="text-2xl font-bold">{item.title}</h1>

                {/* PRICE + CONDITION */}
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-light">R{numeral(item.price).format("0,0")}</h2>
                  <ItemConditionBadge condition={item.condition} className="capitalize text-base" />
                </div>

                {/* ADDRESS */}
                <div className="space-y-1">
                  <h3 className="text-lg font-light">Location:</h3>
                  <p className="text-lg">
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
                  <h3 className="text-lg font-light">Description:</h3>
                  <ReactMarkdown>{item.description}</ReactMarkdown>
                </div>
              </div>

              {/* ACTIONS / APPROVALS */}
{/* ACTIONS / APPROVALS */}
<div className="mt-4">
  {item.status !== "sold" ? (
    <>
      {!(verifiedToken?.admin && item.status === "draft") && (
        <div className="grid grid-cols-2 gap-2">
          {(!verifiedToken || (!verifiedToken.admin && verifiedToken.uid !== item.sellerId)) && (
            <BuyButton id={item.id} />
          )}
          {verifiedToken?.uid === item.sellerId && item.status === "draft" && <SellButton id={item.id} />}
          {((verifiedToken?.admin && item.status === "for-sale") ||
            (verifiedToken?.uid === item.sellerId && ["draft", "for-sale"].includes(item.status))) && (
            <WithdrawButton id={item.id} />
          )}

          {/* Publish button logic */}
          {((verifiedToken?.admin || verifiedToken?.uid === item.sellerId) && item.status === "withdrawn") && (
            <PublishButton id={item.id} />
          )}

          <BackButton />
        </div>
      )}
      {verifiedToken?.admin && item.status === "draft" && (
        <ApproveForm id={item.id} condition={item.condition} />
      )}
    </>
  ) : (
    <BackButton />
  )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
