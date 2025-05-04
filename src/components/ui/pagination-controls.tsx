
import React from 'react';
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export const PaginationControls: React.FC<PaginationControlsProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className = "",
}) => {
  // Generate array of pages to display
  const generatePagesToShow = () => {
    // Always show first and last page
    // Show 5 pages total if possible (current, 2 before, 2 after)
    // Use ellipsis when needed
    
    if (totalPages <= 5) {
      // If there are 5 or fewer pages, show all
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    
    let pages = [currentPage];
    
    // Add up to 2 pages before current
    for (let i = 1; i <= 2; i++) {
      if (currentPage - i >= 1) {
        pages.unshift(currentPage - i);
      }
    }
    
    // Add up to 2 pages after current
    for (let i = 1; i <= 2; i++) {
      if (currentPage + i <= totalPages) {
        pages.push(currentPage + i);
      }
    }
    
    // If we're showing fewer than 5 pages, add more
    while (pages.length < 5) {
      if (pages[0] > 1) {
        pages.unshift(pages[0] - 1);
      } else if (pages[pages.length - 1] < totalPages) {
        pages.push(pages[pages.length - 1] + 1);
      } else {
        break;
      }
    }
    
    return pages;
  };
  
  const pagesToShow = generatePagesToShow();
  
  // Should we show the left ellipsis?
  const showLeftEllipsis = pagesToShow[0] > 1;
  
  // Should we show the right ellipsis?
  const showRightEllipsis = pagesToShow[pagesToShow.length - 1] < totalPages;
  
  // Only show pagination if there's more than one page
  if (totalPages <= 1) return null;

  return (
    <Pagination className={className}>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious 
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (currentPage > 1) onPageChange(currentPage - 1);
            }}
            aria-disabled={currentPage === 1}
            className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
          />
        </PaginationItem>
        
        {/* First page if not in the generated pages */}
        {showLeftEllipsis && (
          <>
            <PaginationItem>
              <PaginationLink 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  onPageChange(1);
                }}
                isActive={currentPage === 1}
              >
                1
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
          </>
        )}
        
        {/* Generated pages */}
        {pagesToShow.map(page => (
          <PaginationItem key={page}>
            <PaginationLink 
              href="#" 
              onClick={(e) => {
                e.preventDefault();
                onPageChange(page);
              }}
              isActive={page === currentPage}
            >
              {page}
            </PaginationLink>
          </PaginationItem>
        ))}
        
        {/* Last page if not in the generated pages */}
        {showRightEllipsis && (
          <>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  onPageChange(totalPages);
                }}
                isActive={currentPage === totalPages}
              >
                {totalPages}
              </PaginationLink>
            </PaginationItem>
          </>
        )}
        
        <PaginationItem>
          <PaginationNext 
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (currentPage < totalPages) onPageChange(currentPage + 1);
            }}
            aria-disabled={currentPage === totalPages}
            className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};
