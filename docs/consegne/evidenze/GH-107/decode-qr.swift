import Foundation
import Vision

for path in CommandLine.arguments.dropFirst() {
    let request = VNDetectBarcodesRequest()
    request.symbologies = [.qr]
    let handler = VNImageRequestHandler(url: URL(fileURLWithPath: path))
    try handler.perform([request])
    let values = (request.results ?? []).compactMap { $0.payloadStringValue }
    let json = try JSONSerialization.data(withJSONObject: ["file": URL(fileURLWithPath: path).lastPathComponent, "decoded": values])
    print(String(data: json, encoding: .utf8)!)
    if values.count != 1 { exit(1) }
}
