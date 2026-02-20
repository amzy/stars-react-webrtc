//
//  JitsiCaptureInjector.m
//  react-native-webrtc
//
//  Created by Amzad Khan on 11/10/25.
//

#import "JitsiCaptureInjector.h"
#import "I420Converter.h"

@interface JitsiCaptureInjector ()
@property(nonatomic, retain) I420Converter *i420Converter;
@end

NS_ASSUME_NONNULL_BEGIN
@implementation JitsiCaptureInjector
+ (instancetype)shared {
    static JitsiCaptureInjector *sharedInstance = nil;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        sharedInstance = [[JitsiCaptureInjector alloc] init];
    });
    return sharedInstance;
}

+(CVPixelBufferRef)pixelBufferFromI420:(RTCI420Buffer *)i420Buffer {
    if (JitsiCaptureInjector.shared.i420Converter == nil) {
        I420Converter *converter = [[I420Converter alloc] init];
        vImage_Error err = [converter prepareForAccelerateConversion];

        if (err != kvImageNoError) {
            NSLog(@"Error when preparing i420Converter: %ld", err);
            return NULL;
        }
        JitsiCaptureInjector.shared.i420Converter = converter;
    }
    CVPixelBufferRef convertedPixelBuffer = [JitsiCaptureInjector.shared.i420Converter convertI420ToPixelBuffer:i420Buffer];
    return convertedPixelBuffer;
}

@end
NS_ASSUME_NONNULL_END
