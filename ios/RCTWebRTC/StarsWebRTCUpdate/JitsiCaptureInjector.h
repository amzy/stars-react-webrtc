//
//  JitsiCaptureInjector.h
//  react-native-webrtc
//
//  Created by Amzad Khan on 11/10/25.
//


#import <Foundation/Foundation.h>
#import <AVFoundation/AVFoundation.h>
#import "JitsiCameraVideoCapturer.h"
#import <WebRTC/RTCVideoFrame.h>
#import <WebRTC/RTCVideoTrack.h>
#import <WebRTC/RTCPeerConnection.h>
#import <CoreMedia/CoreMedia.h>
#import "PIPController.h"
@class RTCI420Buffer;
NS_ASSUME_NONNULL_BEGIN

@protocol JitsiCameraVideoCapturerDataSource <NSObject>
-(void)sampleBufferCaptured:(CMSampleBufferRef)sampleBuffer orientation:(RTCVideoRotation)rotation;
-(RTCVideoFrame *_Nullable)processframeCaptured:(RTCVideoFrame *)videoFrame;
-(JitsiCameraVideoCapturer *_Nullable)videoCapturerFrom:(RTCVideoSource *)videoSource;
-(void)localCameraDidStartTrack:(RTCVideoTrack *)videoTrack;
-(void)mediaTrackDidAdded:(RTCRtpReceiver *)rtpReceiver data:(NSDictionary *_Nonnull)data;
-(void)mediaTrackDidRemoved:(RTCRtpReceiver *)rtpReceiver data:(NSDictionary *_Nonnull)data;

@end

@interface JitsiCaptureInjector : NSObject
@property(nonatomic, nullable, strong)JitsiCameraVideoCapturer *capturer;
@property(nonatomic, nullable, weak)id<JitsiCameraVideoCapturerDataSource> cameraVideoCapturerSource;
@property(nonatomic, nullable, weak) id<RTCPeerConnectionDelegate> peerConnectionDelegate;
+(instancetype _Nonnull)shared;
+(CVPixelBufferRef)pixelBufferFromI420:(RTCI420Buffer *)i420Buffer;

@end


NS_ASSUME_NONNULL_END
