import { apiRequest } from "./api";
import type {
  CreateQuoteRequest,
  CreateQuoteResponse,
  GetQuoteResponse,
  GetQuotesResponse,
} from "../types/quote";

export async function createQuote(
  payload: CreateQuoteRequest,
): Promise<CreateQuoteResponse> {
  return apiRequest<CreateQuoteResponse>("/quotes", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getQuote(id: string): Promise<GetQuoteResponse> {
  return apiRequest<GetQuoteResponse>(`/quotes/${encodeURIComponent(id)}`);
}

export async function getQuotes(): Promise<GetQuotesResponse> {
  return apiRequest<GetQuotesResponse>("/quotes");
}
