"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/auth";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { GetItemResponse } from "@/types/GetItemResponse";
import type { Item } from "@/types/item";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Image from "next/image";
import numeral from "numeral";
import BackButton from "./back-button";
import imageUrlFormatter from "@/lib/imageUrlFormatter";
import ItemConditionBadge from "@/components/item-condition-badge";
import ReactMarkdown from "react-markdown";
import BuyButton from "./buy-button";
import SellButton from "./sell-button";
import WithdrawButton from "./withdraw-button";
import PublishButton from "./publish-button";
import ApproveForm from "./approve-form";
import Script from "next/script";
import Link from "next/link";

export default function Item() {
  const { itemId } = useParams() as { itemId: string };
  const auth = useAuth();
  const [item, setItem] = useState<Item | null>(null);
  const [relatedItems, setRelatedItems] = useState<Item[]>([]);
  const [relatedItemsLoading, setRelatedItemsLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [claims, setClaims] = useState<any>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Get token and claims
  useEffect(() => {
    const fetchAuth = async () => {
      const user = auth?.currentUser;
      if (user) {
        const tokenResult = await user.getIdTokenResult();
        setToken(tokenResult.token);
        setClaims(tokenResult.claims);
      }
    };

    fetchAuth();
  }, [auth]);

  // Fetch item
  const fetchItem = useCallback(async () => {
    if (!itemId) return;

    try {
      const response = await fetch(`/api/items/read?itemId=${itemId}`, {
        method: "GET",
      });

      const result: GetItemResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to fetch item");
      }

      setItem(result.item);
    } catch (err: any) {
      console.error("Fetch item error:", err);
      toast.error("Error!", {
        description: err.message || "Failed to fetch item.",
      });
    }
  }, [itemId]);

  // Fetch related items
  const fetchRelatedItems = useCallback(async () => {
    if (!itemId) return;

    setRelatedItemsLoading(true);

    try {
      const response = await fetch(`/api/items/related?itemId=${itemId}&limit=4`, {
        method: "GET",
      });

      if (!response.ok) {
        if (response.status === 404) {
          // Handle case where item is not found
          setRelatedItems([]);
          return;
        }
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Invalid response format: Expected JSON");
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || "Failed to fetch related items");
      }

      setRelatedItems(result.items || []);
    } catch (err: any) {
      console.error("Fetch related items error:", err);
      setRelatedItems([]);
      toast.error("Error!", {
        description: "Failed to load related items.",
      });
    } finally {
      setRelatedItemsLoading(false);
    }
  }, [itemId]);

  useEffect(() => {
    fetchItem();
    fetchRelatedItems();
  }, [fetchItem, fetchRelatedItems, refreshTrigger]);

  // Listen for refresh events from child components
  useEffect(() => {
    const handleRefresh = () => {
      setRefreshTrigger((prev) => prev + 1);
    };
    window.addEventListener("itemStatusUpdated", handleRefresh);
    return () => window.removeEventListener("itemStatusUpdated", handleRefresh);
  }, []);

  if (!item) {
    return (
      <h1 className="text-center text-zinc-400 py-20 font-bold text-3xl">
        Loading item...
      </h1>
    );
  }

  const images = (item.images ?? []).slice(0, 3);
  const addressLines = [item.collectionAddress].filter(Boolean);

  // Capitalize the first letter of the category
  const capitalizeCategory = (category: string) => {
    if (!category) return "";
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  return (
    <div className="max-w-5xl mx-auto p-4">
      {/* Gallery Script */}
      <Script id="gallery-logic" strategy="afterInteractive">{`
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
      `}</Script>

      {/* Main Item Card */}
      <Card className="shadow-sm">
        <CardContent className="space-y-6">
          <div className="flex flex-col md:flex-row md:gap-6">
            {/* IMAGES */}
            {!!images.length && (
              <div id="item-gallery-root" className="w-full md:w-1/2 space-y-4">
                <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-gray-100">
                  {images.length === 1 ? (
                    <Image
                      fill
                      className="object-contain p-2"
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
                        className={
                          idx === 0
                            ? "absolute inset-0 opacity-100"
                            : "absolute inset-0 hidden opacity-0"
                        }
                      >
                        <Image
                          fill
                          className="object-contain transition-opacity duration-300"
                          src={imageUrlFormatter(img)}
                          alt={`Item image ${idx + 1}`}
                          sizes="(max-width: 768px) 100vw, 800px"
                          priority={idx === 0}
                        />
                      </div>
                    ))
                  )}
                </div>

                {images.length > 1 && (
                  <Carousel
                    opts={{ align: "start" }}
                    className="w-full px-2 overflow-x-auto"
                  >
                    <CarouselContent className="flex gap-4">
                      {images.map((img, index) => (
                        <CarouselItem
                          key={img}
                          className="flex-none sm:basis-1/3 md:basis-1/4"
                        >
                          <button
                            type="button"
                            data-thumb-index={index}
                            className="block w-full m-1"
                            aria-label={`Show image ${index + 1}`}
                          >
                            <Card className="cursor-pointer relative aspect-square overflow-hidden rounded-lg bg-gray-100">
                              <Image
                                fill
                                className="object-contain"
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
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-light">
                    R{numeral(item.price).format("0,0")}
                  </h2>
                  <ItemConditionBadge
                    condition={item.condition}
                    className="capitalize text-base"
                  />
                </div>

                {item.category && (
                  <div className="flex flex-row">
                    <h3 className="text-md font-semibold pr-1">Category: </h3>
                    <h3 className="text-md font-normal">{capitalizeCategory(item.category)}</h3>
                  </div>
                )}

                <div className="space-y-1">
                  <h3 className="text-lg font-bold">Location:</h3>
                  <p className="text-md">
                    {addressLines.map((line, idx) => (
                      <span key={idx}>
                        {line}
                        {idx < addressLines.length - 1 && ", "}
                      </span>
                    ))}
                  </p>
                </div>

                <div className="max-w-screen-md leading-relaxed pb-2">
                  <h3 className="text-lg font-bold">Description:</h3>
                  <ReactMarkdown>{item.description}</ReactMarkdown>
                </div>
              </div>

              {/* ACTIONS */}
              <div className="mt-4">
                {item.status !== "sold" ? (
                  <>
                    <div className="flex flex-wrap gap-2">
                      {claims?.user_id !== item.sellerId && (
                        <div className="w-full flex-1">
                          <BuyButton id={item.id} />
                        </div>
                      )}

                      {claims?.user_id === item.sellerId &&
                        item.status === "draft" && (
                          <div className="w-full flex-1">
                            <SellButton id={item.id} />
                          </div>
                        )}

                      {claims?.user_id === item.sellerId &&
                        ["draft", "for-sale"].includes(item.status) && (
                          <div className="w-full flex-1">
                            <WithdrawButton id={item.id} />
                          </div>
                        )}

                      {(claims?.admin || claims?.user_id === item.sellerId) &&
                        item.status === "withdrawn" && (
                          <div className="w-full flex-1">
                            <PublishButton id={item.id} />
                          </div>
                        )}

                      <div className="w-full flex-1">
                        <BackButton />
                      </div>
                    </div>

                    {claims?.admin && (
                      <div className="mt-4">
                        <ApproveForm
                          id={item.id}
                          condition={item.condition}
                          status={item.status}
                        />
                      </div>
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

      {/* Related Items Card */}
      {relatedItemsLoading ? (
        <div className="text-center text-zinc-400 py-10">
          Loading related items...
        </div>
      ) : relatedItems.length > 0 ? (
        <Card className="shadow-sm mt-6">
          <CardContent className="">
            <h3 className="text-lg font-bold pl-4 text-center pb-2">Related Items</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedItems.slice(0, 4).map((relatedItem) => (
                <Link
                  key={relatedItem.id}
                  href={`/item/${relatedItem.id}`}
                  className="block"
                >
                  <Card className="p-3 hover:shadow-md transition-shadow">
                    <CardContent className="p-0">
                      <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-gray-100 mb-2">
                        <Image
                          fill
                          className="object-contain"
                          src={imageUrlFormatter(relatedItem.images?.[0] || "/placeholder-image.jpg")}
                          alt={relatedItem.title}
                          sizes="(max-width: 768px) 50vw, 200px"
                        />
                      </div>
                      <h4 className="text-sm font-semibold truncate">{relatedItem.title}</h4>
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-gray-600">R{numeral(relatedItem.price).format("0,0")}</p>
                        <ItemConditionBadge
                          condition={relatedItem.condition}
                          className="capitalize text-xs"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}