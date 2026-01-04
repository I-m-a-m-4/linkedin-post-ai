"use client";

import { PlaceHolderImages } from '@/lib/placeholder-images';

export const Carousel3D = () => {
    const images = PlaceHolderImages.filter(img => img.id.startsWith('carousel'));
    const totalImages = images.length;
    const radius = 450;

    return (
        <div className="absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]">
            <div className="scene">
                <div className="carousel">
                    {images.map((image, index) => {
                        const angle = (360 / totalImages) * index;
                        return (
                            <div
                                key={image.id}
                                className="carousel__cell"
                                style={{
                                    backgroundImage: `url(${image.imageUrl})`,
                                    transform: `rotateY(${angle}deg) translateZ(${radius}px)`,
                                }}
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
